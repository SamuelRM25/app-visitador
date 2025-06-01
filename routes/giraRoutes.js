// routes/giraRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Rutas para Giras
// 1. Crear una nueva Gira
// Endpoint: POST /api/giras
router.post('/giras', async (req, res) => {
    const { nombre_gira, id_usuario, fecha_inicio, fecha_fin, descripcion } = req.body;

    if (!nombre_gira || !id_usuario || !fecha_inicio) {
        return res.status(400).json({ message: 'Nombre de gira, usuario y fecha de inicio son obligatorios.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO Giras (nombre_gira, id_usuario, fecha_inicio, fecha_fin, descripcion) VALUES (?, ?, ?, ?, ?)',
            [nombre_gira, id_usuario, fecha_inicio, fecha_fin || null, descripcion || null]
        );
        res.status(201).json({ message: 'Gira creada exitosamente', id_gira: result.insertId });
    } catch (err) {
        console.error('Error al crear gira:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});

// 2. Obtener todas las Giras
// Endpoint: GET /api/giras
router.get('/giras', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Giras');
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener giras:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});

// 3. Agregar un municipio a una Gira
// Endpoint: POST /api/giras/:id_gira/municipios
router.post('/giras/:id_gira/municipios', async (req, res) => {
    const { id_gira } = req.params;
    const { id_municipio } = req.body;

    if (!id_municipio) {
        return res.status(400).json({ message: 'ID de municipio es obligatorio.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO Giras_Municipios (id_gira, id_municipio) VALUES (?, ?)',
            [id_gira, id_municipio]
        );
        res.status(201).json({ message: 'Municipio agregado a la gira exitosamente', id: result.insertId });
    } catch (err) {
        console.error('Error al agregar municipio a gira:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});

// 4. Obtener municipios de una Gira
// Endpoint: GET /api/giras/:id_gira/municipios
router.get('/giras/:id_gira/municipios', async (req, res) => {
    const { id_gira } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT gm.*, m.nombre_municipio, d.nombre_departamento
            FROM Giras_Municipios gm
            JOIN Municipio m ON gm.id_municipio = m.id_municipio
            JOIN Departamento d ON m.id_departamento = d.id_departamento
            WHERE gm.id_gira = ?
        `, [id_gira]);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener municipios de la gira:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});

// 5. Agregar un cliente a una Gira por Municipio
// Endpoint: POST /api/giras/:id_gira/municipios/:id_municipio/clientes
router.post('/giras/:id_gira/municipios/:id_municipio/clientes', async (req, res) => {
    const { id_gira, id_municipio } = req.params;
    const { id_cliente } = req.body;

    if (!id_cliente) {
        return res.status(400).json({ message: 'ID de cliente es obligatorio.' });
    }

    try {
        // Verificar si la combinación gira-municipio existe
        const [giraMun] = await pool.query('SELECT id_gira_municipio FROM Giras_Municipios WHERE id_gira = ? AND id_municipio = ?', [id_gira, id_municipio]);
        if (giraMun.length === 0) {
            return res.status(404).json({ message: 'La combinación de Gira y Municipio no existe.' });
        }
        const id_gira_municipio = giraMun[0].id_gira_municipio;

        const [result] = await pool.query(
            'INSERT INTO Gira_Clientes (id_gira_municipio, id_cliente) VALUES (?, ?)',
            [id_gira_municipio, id_cliente]
        );
        res.status(201).json({ message: 'Cliente agregado a la gira por municipio exitosamente', id: result.insertId });
    } catch (err) {
        console.error('Error al agregar cliente a gira por municipio:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});

// 6. Obtener clientes de una Gira por Municipio
// Endpoint: GET /api/giras/:id_gira/municipios/:id_municipio/clientes
router.get('/giras/:id_gira/municipios/:id_municipio/clientes', async (req, res) => {
    const { id_gira, id_municipio } = req.params;

    try {
        const [rows] = await pool.query(`
            SELECT
                gc.*,
                c.nombre_cliente,
                c.direccion_cliente,
                c.telefono_cliente
            FROM Gira_Clientes gc
            JOIN Giras_Municipios gm ON gc.id_gira_municipio = gm.id_gira_municipio
            JOIN Clientes c ON gc.id_cliente = c.id_cliente
            WHERE gm.id_gira = ? AND gm.id_municipio = ?
        `, [id_gira, id_municipio]);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener clientes de la gira por municipio:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});


module.exports = router;