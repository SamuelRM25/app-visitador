const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Obtener inventario de bodega
router.get('/:id/inventario', async (req, res) => {
  try {
    const [inventario] = await pool.query(
      `SELECT ib.*, m.nombre_medicamento, m.presentacion, m.precio_unitario
       FROM inventario_bodega ib
       JOIN medicamentos m ON ib.id_medicamento = m.id_medicamento
       WHERE ib.id_bodega = ?`,
      [req.params.id]
    );
    
    res.json({ success: true, data: inventario });
  } catch (error) {
    console.error('Error al obtener inventario de bodega:', error);
    res.status(500).json({ success: false, message: 'Error al obtener inventario de bodega' });
  }
});

module.exports = router;