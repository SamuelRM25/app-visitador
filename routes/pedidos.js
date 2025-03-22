const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Obtener todos los pedidos
router.get('/', async (req, res) => {
  try {
    const [pedidos] = await pool.query('SELECT * FROM pedidos');
    res.json({ success: true, data: pedidos });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener pedidos' });
  }
});

// Obtener detalles de un pedido
router.get('/:id/detalles', async (req, res) => {
  try {
    const [detalles] = await pool.query(
      `SELECT dp.*, m.nombre_medicamento, m.presentacion 
       FROM detalles_pedido dp
       JOIN medicamentos m ON dp.id_medicamento = m.id_medicamento
       WHERE dp.id_pedido = ?`,
      [req.params.id]
    );
    
    res.json({ success: true, data: detalles });
  } catch (error) {
    console.error('Error al obtener detalles del pedido:', error);
    res.status(500).json({ success: false, message: 'Error al obtener detalles del pedido' });
  }
});

module.exports = router;