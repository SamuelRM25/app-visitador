// routes/inventarioRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Middleware para validar si es un número válido (para cantidad)
function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

// 1. Obtener inventario por bodega (o todo el inventario si no se especifica bodega)
// Endpoint: GET /api/inventario o /api/inventario?id_bodega=X
router.get('/inventario', async (req, res) => {
    const { id_bodega } = req.query;
    let query = `
        SELECT
            ib.id_inventario,
            ib.id_bodega,
            ib.id_usuario,
            ib.id_medicamento,
            ib.cantidad_medicamento,
            m.nombre_medicamento,
            m.presentacion_medicamento
        FROM Inventario_Bodega ib
        JOIN Medicamento m ON ib.id_medicamento = m.id_medicamento
    `;
    const params = [];

    if (id_bodega) {
        query += ' WHERE ib.id_bodega = ?';
        params.push(id_bodega);
    }

    try {
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener inventario:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});

// 2. Agregar/Actualizar cantidad de medicamento en inventario
// Endpoint: POST /api/inventario/agregar
// Este endpoint maneja tanto la adición de un nuevo item al inventario como la actualización de la cantidad
router.post('/inventario/agregar', async (req, res) => {
    const { id_bodega, id_usuario, id_medicamento, cantidad_medicamento } = req.body;

    if (!id_bodega || !id_usuario || !id_medicamento || !isNumeric(cantidad_medicamento) || cantidad_medicamento <= 0) {
        return res.status(400).json({ message: 'Datos de inventario incompletos o cantidad inválida.' });
    }

    try {
        const [existing] = await pool.query(
            'SELECT id_inventario, cantidad_medicamento FROM Inventario_Bodega WHERE id_bodega = ? AND id_medicamento = ?',
            [id_bodega, id_medicamento]
        );

        if (existing.length > 0) {
            // Si ya existe, actualizar la cantidad
            const newQuantity = existing[0].cantidad_medicamento + cantidad_medicamento;
            await pool.query(
                'UPDATE Inventario_Bodega SET cantidad_medicamento = ?, id_usuario = ?, fecha_modificacion = NOW() WHERE id_inventario = ?',
                [newQuantity, id_usuario, existing[0].id_inventario]
            );
            res.json({ message: 'Cantidad de medicamento actualizada en inventario', id_inventario: existing[0].id_inventario, new_quantity: newQuantity });
        } else {
            // Si no existe, agregar nuevo registro
            const [result] = await pool.query(
                'INSERT INTO Inventario_Bodega (id_bodega, id_usuario, id_medicamento, cantidad_medicamento) VALUES (?, ?, ?, ?)',
                [id_bodega, id_usuario, id_medicamento, cantidad_medicamento]
            );
            res.status(201).json({ message: 'Medicamento agregado a inventario', id_inventario: result.insertId });
        }
    } catch (err) {
        console.error('Error al agregar/actualizar inventario:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});


// 3. Registrar un movimiento de inventario (entrada/salida/ajuste)
// Endpoint: POST /api/movimientos-inventario
router.post('/movimientos-inventario', async (req, res) => {
    const { id_inventario, tipo_movimiento, cantidad, motivo, id_usuario, id_pedido } = req.body;

    if (!id_inventario || !tipo_movimiento || !isNumeric(cantidad) || !motivo || !id_usuario) {
        return res.status(400).json({ message: 'Datos del movimiento incompletos.' });
    }
    if (!['entrada', 'salida', 'ajuste'].includes(tipo_movimiento)) {
        return res.status(400).json({ message: 'Tipo de movimiento inválido.' });
    }
    if (cantidad <= 0) {
         return res.status(400).json({ message: 'La cantidad del movimiento debe ser positiva.' });
    }


    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Registrar el movimiento
        const [movimientoResult] = await connection.query(
            'INSERT INTO Movimientos_Inventario (id_inventario, tipo_movimiento, cantidad, motivo, id_usuario, id_pedido) VALUES (?, ?, ?, ?, ?, ?)',
            [id_inventario, tipo_movimiento, cantidad, motivo, id_usuario, id_pedido || null] // id_pedido puede ser nulo
        );

        // 2. Actualizar la cantidad en Inventario_Bodega
        let updateQuery;
        if (tipo_movimiento === 'entrada' || tipo_movimiento === 'ajuste') { // Ajuste puede ser entrada o salida, aquí lo asumo como entrada para simplificar.
            updateQuery = 'UPDATE Inventario_Bodega SET cantidad_medicamento = cantidad_medicamento + ?, fecha_modificacion = NOW() WHERE id_inventario = ?';
        } else if (tipo_movimiento === 'salida') {
            // Verificar si hay suficiente cantidad antes de la salida
            const [inventario] = await connection.query('SELECT cantidad_medicamento FROM Inventario_Bodega WHERE id_inventario = ?', [id_inventario]);
            if (inventario.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Inventario no encontrado.' });
            }
            if (inventario[0].cantidad_medicamento < cantidad) {
                await connection.rollback();
                return res.status(400).json({ message: 'Cantidad insuficiente en inventario para esta salida.' });
            }
            updateQuery = 'UPDATE Inventario_Bodega SET cantidad_medicamento = cantidad_medicamento - ?, fecha_modificacion = NOW() WHERE id_inventario = ?';
        }

        await connection.query(updateQuery, [cantidad, id_inventario]);

        await connection.commit();
        res.status(201).json({ message: 'Movimiento de inventario registrado y cantidad actualizada', id_movimiento: movimientoResult.insertId });

    } catch (err) {
        await connection.rollback();
        console.error('Error al registrar movimiento de inventario:', err);
        res.status(500).json({ message: 'Error interno del servidor al registrar movimiento', error: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;