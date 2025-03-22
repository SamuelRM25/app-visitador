const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const [clientes] = await pool.query('SELECT * FROM clientes');
    res.json({ success: true, data: clientes });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener clientes' });
  }
});

// Obtener clientes por gira
router.get('/gira/:id', async (req, res) => {
  try {
    const [clientes] = await pool.query(
      'SELECT * FROM clientes WHERE id_gira = ?',
      [req.params.id]
    );
    
    res.json({ success: true, data: clientes });
  } catch (error) {
    console.error('Error al obtener clientes por gira:', error);
    res.status(500).json({ success: false, message: 'Error al obtener clientes por gira' });
  }
});

module.exports = router;