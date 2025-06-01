// routes/medicamentoRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Tu conexión a la base de datos

// Middleware para validar si es un número válido (para precio y cantidad)
function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

// 1. Obtener todos los medicamentos disponibles (para 'fetchAvailableMedicines')
// Endpoint: GET /api/medicamentos
router.get('/medicamentos', async (req, res) => {
    try {
        // Unir Medicamento con Inventario_Bodega para obtener la cantidad disponible
        const [rows] = await pool.query(`
            SELECT
                m.id_medicamento,
                m.nombre_medicamento,
                m.molecula_medicamento,
                m.presentacion_medicamento,
                m.precio_medicamento,
                COALESCE(SUM(ib.cantidad_medicamento), 0) AS cantidad_disponible
            FROM Medicamento m
            LEFT JOIN Inventario_Bodega ib ON m.id_medicamento = ib.id_medicamento
            WHERE m.activo = 1
            GROUP BY m.id_medicamento
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener medicamentos disponibles:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});

// 2. Obtener un medicamento por ID
// Endpoint: GET /api/medicamentos/:id
router.get('/medicamentos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Medicamento WHERE id_medicamento = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Medicamento no encontrado' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error al obtener medicamento por ID:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});

// 3. Agregar un nuevo medicamento
// Endpoint: POST /api/medicamentos
router.post('/medicamentos', async (req, res) => {
    const { id_medicamento, nombre_medicamento, molecula_medicamento, presentacion_medicamento, precio_medicamento } = req.body;

    if (!id_medicamento || !nombre_medicamento || !molecula_medicamento || !presentacion_medicamento || !precio_medicamento) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    if (!isNumeric(precio_medicamento)) {
        return res.status(400).json({ message: 'El precio del medicamento debe ser un número válido' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO Medicamento (id_medicamento, nombre_medicamento, molecula_medicamento, presentacion_medicamento, precio_medicamento) VALUES (?, ?, ?, ?, ?)',
            [id_medicamento, nombre_medicamento, molecula_medicamento, presentacion_medicamento, precio_medicamento]
        );
        res.status(201).json({ message: 'Medicamento agregado exitosamente', id: result.insertId });
    } catch (err) {
        console.error('Error al agregar medicamento:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});

// 4. Actualizar un medicamento existente
// Endpoint: PUT /api/medicamentos/:id
router.put('/medicamentos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre_medicamento, molecula_medicamento, presentacion_medicamento, precio_medicamento, activo } = req.body;

    if (!nombre_medicamento || !molecula_medicamento || !presentacion_medicamento || !precio_medicamento) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    if (!isNumeric(precio_medicamento)) {
        return res.status(400).json({ message: 'El precio del medicamento debe ser un número válido' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE Medicamento SET nombre_medicamento = ?, molecula_medicamento = ?, presentacion_medicamento = ?, precio_medicamento = ?, activo = ? WHERE id_medicamento = ?',
            [nombre_medicamento, molecula_medicamento, presentacion_medicamento, precio_medicamento, activo, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medicamento no encontrado para actualizar' });
        }
        res.json({ message: 'Medicamento actualizado exitosamente' });
    } catch (err) {
        console.error('Error al actualizar medicamento:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});

// 5. Eliminar (desactivar) un medicamento
// Endpoint: DELETE /api/medicamentos/:id (o PUT para cambiar 'activo' a 0)
router.delete('/medicamentos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // En lugar de borrar, se recomienda desactivar
        const [result] = await pool.query('UPDATE Medicamento SET activo = 0 WHERE id_medicamento = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medicamento no encontrado para desactivar' });
        }
        res.json({ message: 'Medicamento desactivado exitosamente' });
    } catch (err) {
        console.error('Error al desactivar medicamento:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});

module.exports = router;