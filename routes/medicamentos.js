const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Obtener todos los medicamentos
router.get('/', async (req, res) => {
  try {
    const [medicamentos] = await pool.query('SELECT * FROM medicamentos');
    res.json({ success: true, data: medicamentos });
  } catch (error) {
    console.error('Error al obtener medicamentos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener medicamentos' });
  }
});

// Obtener un medicamento por ID
router.get('/:id', async (req, res) => {
  try {
    const [medicamentos] = await pool.query(
      'SELECT * FROM medicamentos WHERE id_medicamento = ?',
      [req.params.id]
    );
    
    if (medicamentos.length === 0) {
      return res.status(404).json({ success: false, message: 'Medicamento no encontrado' });
    }
    
    res.json({ success: true, data: medicamentos[0] });
  } catch (error) {
    console.error('Error al obtener medicamento:', error);
    res.status(500).json({ success: false, message: 'Error al obtener medicamento' });
  }
});

module.exports = router;