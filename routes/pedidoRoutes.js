// routes/pedidoRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener un pedido y sus detalles
// Endpoint: GET /api/pedidos/:id
router.get('/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
        // Obtener el pedido principal
        const [pedidoRows] = await connection.query('SELECT * FROM Pedidos WHERE id_pedido = ?', [id]);
        if (pedidoRows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        const pedido = pedidoRows[0];

        // Obtener los detalles de ese pedido
        const [detallesRows] = await connection.query(`
            SELECT
                dp.*,
                m.nombre_medicamento,
                m.presentacion_medicamento
            FROM Detalles_Pedidos dp
            JOIN Medicamento m ON dp.id_medicamento = m.id_medicamento
            WHERE dp.id_pedido = ?
        `, [id]);

        // Combinar pedido con sus detalles (si quieres que el frontend lo maneje así)
        // O simplemente enviar ambos por separado, que es lo que espera tu Pedido model actual
        // Para que coincida con tu modelo 'Pedido' que NO tiene 'detallesPedido' directamente:
        res.json({
            pedido: pedido,
            detalles_pedido: detallesRows
        });

    } catch (err) {
        console.error('Error al obtener pedido y detalles:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    } finally {
        connection.release();
    }
});

// Obtener detalles de pedido (para fetchDetallesPedido)
// Endpoint: GET /api/detalles-pedido?id_pedido=X
router.get('/detalles-pedido', async (req, res) => {
    const { id_pedido } = req.query;
    if (!id_pedido) {
        return res.status(400).json({ message: 'El parámetro id_pedido es requerido.' });
    }
    try {
        const [rows] = await pool.query(`
            SELECT
                dp.id_detalle_pedido,
                dp.id_pedido,
                dp.id_inventario,
                dp.id_medicamento,
                dp.cantidad_medicamento,
                dp.precio_unitario,
                dp.subtotal_medicamento,
                dp.estado_pedido,
                dp.fecha_creacion,
                dp.fecha_modificacion,
                m.nombre_medicamento
                -- No hay 'presentacion_medicamento' en tu DetallePedido original, pero la BD sí la tiene en Medicamento
                -- m.presentacion_medicamento // Descomentar si añades a DetallePedido
            FROM Detalles_Pedidos dp
            JOIN Medicamento m ON dp.id_medicamento = m.id_medicamento
            WHERE dp.id_pedido = ?
        `, [id_pedido]);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener detalles de pedido:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});


// 2. Crear un nuevo pedido con sus detalles
// Endpoint: POST /api/pedidos
router.post('/pedidos', async (req, res) => {
    const { id_cliente, id_usuario, pedido_entregado, detalles } = req.body; // detalles es un array de objetos { id_medicamento, cantidad, id_inventario }

    if (!id_cliente || !id_usuario || !detalles || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({ message: 'Datos de pedido incompletos o inválidos.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let totalPedido = 0;
        const processedDetalles = []; // Para almacenar detalles con precios calculados

        for (const item of detalles) {
            const { id_medicamento, cantidad, id_inventario } = item;
            if (!id_medicamento || !cantidad || cantidad <= 0 || !id_inventario) {
                throw new Error('Detalle de pedido inválido: id_medicamento, cantidad e id_inventario son requeridos y la cantidad debe ser positiva.');
            }

            // 1. Obtener precio del medicamento y verificar cantidad en inventario
            const [medicamentoRows] = await connection.query('SELECT precio_medicamento FROM Medicamento WHERE id_medicamento = ?', [id_medicamento]);
            if (medicamentoRows.length === 0) {
                throw new Error(`Medicamento con ID ${id_medicamento} no encontrado.`);
            }
            const precioUnitario = parseFloat(medicamentoRows[0].precio_medicamento);

            const [inventarioRows] = await connection.query('SELECT cantidad_medicamento FROM Inventario_Bodega WHERE id_inventario = ? AND id_medicamento = ?', [id_inventario, id_medicamento]);
            if (inventarioRows.length === 0 || inventarioRows[0].cantidad_medicamento < cantidad) {
                throw new Error(`Cantidad insuficiente para el medicamento ${id_medicamento} en inventario ${id_inventario}.`);
            }

            const subtotalMedicamento = precioUnitario * cantidad;
            totalPedido += subtotalMedicamento;

            processedDetalles.push({
                id_inventario,
                id_medicamento,
                cantidad,
                precio_unitario: precioUnitario,
                subtotal_medicamento: subtotalMedicamento,
                estado_pedido: 'abonado' // Estado inicial para detalles
            });
        }

        // 2. Insertar el Pedido
        const [pedidoResult] = await connection.query(
            'INSERT INTO Pedidos (id_cliente, id_usuario, pedido_entregado, total_pedido) VALUES (?, ?, ?, ?)',
            [id_cliente, id_usuario, pedido_entregado || 'no', totalPedido]
        );
        const idPedido = pedidoResult.insertId;

        // 3. Insertar los Detalles del Pedido y actualizar Inventario
        for (const item of processedDetalles) {
            await connection.query(
                'INSERT INTO Detalles_Pedidos (id_pedido, id_inventario, id_medicamento, cantidad_medicamento, precio_unitario, subtotal_medicamento, estado_pedido) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [idPedido, item.id_inventario, item.id_medicamento, item.cantidad, item.precio_unitario, item.subtotal_medicamento, item.estado_pedido]
            );

            // Registrar movimiento de salida
            await connection.query(
                'UPDATE Inventario_Bodega SET cantidad_medicamento = cantidad_medicamento - ?, fecha_modificacion = NOW() WHERE id_inventario = ?',
                [item.cantidad, item.id_inventario]
            );

            await connection.query(
                'INSERT INTO Movimientos_Inventario (id_inventario, tipo_movimiento, cantidad, motivo, id_usuario, id_pedido) VALUES (?, ?, ?, ?, ?, ?)',
                [item.id_inventario, 'salida', item.cantidad, 'Venta de pedido', id_usuario, idPedido]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Pedido creado exitosamente', id_pedido: idPedido, total_pedido: totalPedido });

    } catch (err) {
        await connection.rollback();
        console.error('Error al crear pedido:', err.message);
        res.status(500).json({ message: 'Error interno del servidor al crear pedido', error: err.message });
    } finally {
        connection.release();
    }
});

// 3. Actualizar estado de un pedido (ej. de 'no' a 'si' en pedido_entregado)
// Endpoint: PUT /api/pedidos/:id/estado
router.put('/pedidos/:id/estado', async (req, res) => {
    const { id } = req.params;
    const { pedido_entregado } = req.body; // 'si' o 'no'

    if (!['si', 'no'].includes(pedido_entregado)) {
        return res.status(400).json({ message: 'El estado de pedido_entregado debe ser "si" o "no".' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE Pedidos SET pedido_entregado = ?, fecha_modificacion = NOW() WHERE id_pedido = ?',
            [pedido_entregado, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado para actualizar estado' });
        }
        res.json({ message: 'Estado del pedido actualizado exitosamente' });
    } catch (err) {
        console.error('Error al actualizar estado del pedido:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});


module.exports = router;