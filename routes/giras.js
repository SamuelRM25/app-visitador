const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Obtener todas las giras
router.get('/', async (req, res) => {
  try {
    const [giras] = await pool.query(
      `SELECT * FROM giras ORDER BY nombre_gira`
    );
    
    res.json({ success: true, data: giras });
  } catch (error) {
    console.error('Error al obtener giras:', error);
    res.status(500).json({ success: false, message: 'Error al obtener giras' });
  }
});

// Obtener una gira específica por ID con sus clientes
router.get('/:id', async (req, res) => {
  try {
    // Obtener información de la gira
    const [gira] = await pool.query(
      `SELECT * FROM giras WHERE id_gira = ?`,
      [req.params.id]
    );
    
    if (gira.length === 0) {
      return res.status(404).json({ success: false, message: 'Gira no encontrada' });
    }
    
    // Obtener clientes asociados a la gira
    const [clientes] = await pool.query(
      `SELECT * FROM clientes WHERE id_gira = ? ORDER BY nombre_cliente`,
      [req.params.id]
    );
    
    // Construir respuesta con información de gira y sus clientes
    const respuesta = {
      gira: gira[0],
      clientes: clientes
    };
    
    res.json({ success: true, data: respuesta });
  } catch (error) {
    console.error('Error al obtener gira con clientes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener gira con clientes' });
  }
});

// Crear nueva gira
router.post('/', async (req, res) => {
  const { codigo_gira, nombre_gira, descripcion } = req.body;
  
  if (!codigo_gira || !nombre_gira) {
    return res.status(400).json({ 
      success: false, 
      message: 'El código y nombre de la gira son requeridos' 
    });
  }
  
  try {
    const [result] = await pool.query(
      `INSERT INTO giras (codigo_gira, nombre_gira, descripcion, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [codigo_gira, nombre_gira, descripcion || null]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Gira creada exitosamente',
      data: { id_gira: result.insertId }
    });
  } catch (error) {
    console.error('Error al crear gira:', error);
    res.status(500).json({ success: false, message: 'Error al crear gira' });
  }
});

// Actualizar gira
router.put('/:id', async (req, res) => {
  const { codigo_gira, nombre_gira, descripcion } = req.body;
  
  if (!codigo_gira || !nombre_gira) {
    return res.status(400).json({ 
      success: false, 
      message: 'El código y nombre de la gira son requeridos' 
    });
  }
  
  try {
    const [result] = await pool.query(
      `UPDATE giras 
       SET codigo_gira = ?, nombre_gira = ?, descripcion = ?, updated_at = NOW()
       WHERE id_gira = ?`,
      [codigo_gira, nombre_gira, descripcion || null, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Gira no encontrada' });
    }
    
    res.json({ success: true, message: 'Gira actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar gira:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar gira' });
  }
});

// Eliminar gira
router.delete('/:id', async (req, res) => {
  try {
    // Verificar si hay clientes asociados a esta gira
    const [clientes] = await pool.query(
      'SELECT COUNT(*) as count FROM clientes WHERE id_gira = ?',
      [req.params.id]
    );
    
    if (clientes[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se puede eliminar la gira porque tiene clientes asociados' 
      });
    }
    
    const [result] = await pool.query(
      'DELETE FROM giras WHERE id_gira = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Gira no encontrada' });
    }
    
    res.json({ success: true, message: 'Gira eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar gira:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar gira' });
  }
});

// Agregar cliente a una gira
router.post('/:id/clientes', async (req, res) => {
  const { codigo_cliente, nombre_cliente, tipo_cliente, direccion, telefono, notas } = req.body;
  
  if (!nombre_cliente) {
    return res.status(400).json({ 
      success: false, 
      message: 'El nombre del cliente es requerido' 
    });
  }
  
  try {
    // Verificar que la gira existe
    const [gira] = await pool.query(
      'SELECT * FROM giras WHERE id_gira = ?',
      [req.params.id]
    );
    
    if (gira.length === 0) {
      return res.status(404).json({ success: false, message: 'Gira no encontrada' });
    }
    
    // Insertar el nuevo cliente asociado a la gira
    const [result] = await pool.query(
      `INSERT INTO clientes (codigo_cliente, nombre_cliente, tipo_cliente, direccion, telefono, id_gira, notas, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [codigo_cliente || null, nombre_cliente, tipo_cliente || 'OTRO', direccion || null, telefono || null, req.params.id, notas || null]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Cliente agregado a la gira exitosamente',
      data: { id_cliente: result.insertId }
    });
  } catch (error) {
    console.error('Error al agregar cliente a la gira:', error);
    res.status(500).json({ success: false, message: 'Error al agregar cliente a la gira' });
  }
});

module.exports = router;