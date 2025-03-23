const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Check if this file exists and is properly implemented
router.get('/', async (req, res) => {
  try {
    const [bodegas] = await pool.query(
      `SELECT b.*, u.nombre as nombre_usuario
       FROM bodegas b
       LEFT JOIN usuarios u ON b.id_user = u.id_user
       ORDER BY b.nombre_bodega`
    );
    
    res.json({ success: true, data: bodegas });
  } catch (error) {
    console.error('Error al obtener bodegas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener bodegas' });
  }
});

// Obtener todas las bodegas
router.get('/', async (req, res) => {
  try {
    // Add more detailed logging
    console.log('Fetching all bodegas...');
    
    // Simplify the query to troubleshoot
    const [bodegas] = await pool.query(
      `SELECT b.* FROM bodegas b ORDER BY b.nombre_bodega`
    );
    
    console.log(`Found ${bodegas.length} bodegas`);
    res.json({ success: true, data: bodegas });
  } catch (error) {
    console.error('Error al obtener bodegas:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'Error al obtener bodegas', error: error.message });
  }
});

// Obtener una bodega específica por ID
router.get('/:id', async (req, res) => {
  try {
    const [bodega] = await pool.query(
      `SELECT b.*, u.nombre as nombre_usuario
       FROM bodegas b
       LEFT JOIN usuarios u ON b.id_user = u.id_user
       WHERE b.id_bodega = ?`,
      [req.params.id]
    );
    
    if (bodega.length === 0) {
      return res.status(404).json({ success: false, message: 'Bodega no encontrada' });
    }
    
    res.json({ success: true, data: bodega[0] });
  } catch (error) {
    console.error('Error al obtener bodega:', error);
    res.status(500).json({ success: false, message: 'Error al obtener bodega' });
  }
});

// Obtener inventario de bodega con detalles de medicamentos
router.get('/:id/inventario', async (req, res) => {
  try {
    const [inventario] = await pool.query(
      `SELECT ib.id_inventario, ib.id_bodega, ib.id_medicamento, ib.cantidad, 
              ib.fecha_asignacion, ib.created_at, ib.updated_at,
              m.codigo_medicamento, m.nombre_medicamento, m.presentacion, 
              m.descripcion, m.precio_unitario
       FROM inventario_bodega ib
       JOIN medicamentos m ON ib.id_medicamento = m.id_medicamento
       WHERE ib.id_bodega = ?
       ORDER BY m.nombre_medicamento`,
      [req.params.id]
    );
    
    // Obtener información de la bodega
    const [bodega] = await pool.query(
      `SELECT id_bodega, nombre_bodega, descripcion
       FROM bodegas
       WHERE id_bodega = ?`,
      [req.params.id]
    );
    
    if (bodega.length === 0) {
      return res.status(404).json({ success: false, message: 'Bodega no encontrada' });
    }
    
    // Construir respuesta con información de bodega e inventario
    const respuesta = {
      bodega: bodega[0],
      inventario: inventario
    };
    
    res.json({ success: true, data: respuesta });
  } catch (error) {
    console.error('Error al obtener inventario de bodega:', error);
    res.status(500).json({ success: false, message: 'Error al obtener inventario de bodega' });
  }
});

// Obtener resumen de inventario por bodega (cantidad total de medicamentos por bodega)
router.get('/resumen/inventario', async (req, res) => {
  try {
    const [resumen] = await pool.query(
      `SELECT b.id_bodega, b.nombre_bodega, 
              COUNT(DISTINCT ib.id_medicamento) as total_medicamentos,
              SUM(ib.cantidad) as total_unidades
       FROM bodegas b
       LEFT JOIN inventario_bodega ib ON b.id_bodega = ib.id_bodega
       GROUP BY b.id_bodega
       ORDER BY b.nombre_bodega`
    );
    
    res.json({ success: true, data: resumen });
  } catch (error) {
    console.error('Error al obtener resumen de inventario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener resumen de inventario' });
  }
});

// Crear nueva bodega
router.post('/', async (req, res) => {
  const { id_user, nombre_bodega, descripcion } = req.body;
  
  if (!nombre_bodega) {
    return res.status(400).json({ success: false, message: 'El nombre de la bodega es requerido' });
  }
  
  try {
    const [result] = await pool.query(
      `INSERT INTO bodegas (id_user, nombre_bodega, descripcion, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [id_user || null, nombre_bodega, descripcion || null]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Bodega creada exitosamente',
      data: { id_bodega: result.insertId }
    });
  } catch (error) {
    console.error('Error al crear bodega:', error);
    res.status(500).json({ success: false, message: 'Error al crear bodega' });
  }
});

// Actualizar bodega
router.put('/:id', async (req, res) => {
  const { id_user, nombre_bodega, descripcion } = req.body;
  
  if (!nombre_bodega) {
    return res.status(400).json({ success: false, message: 'El nombre de la bodega es requerido' });
  }
  
  try {
    const [result] = await pool.query(
      `UPDATE bodegas 
       SET id_user = ?, nombre_bodega = ?, descripcion = ?, updated_at = NOW()
       WHERE id_bodega = ?`,
      [id_user || null, nombre_bodega, descripcion || null, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Bodega no encontrada' });
    }
    
    res.json({ success: true, message: 'Bodega actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar bodega:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar bodega' });
  }
});

// Eliminar bodega
router.delete('/:id', async (req, res) => {
  try {
    // Verificar si hay inventario asociado a esta bodega
    const [inventario] = await pool.query(
      'SELECT COUNT(*) as count FROM inventario_bodega WHERE id_bodega = ?',
      [req.params.id]
    );
    
    if (inventario[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se puede eliminar la bodega porque tiene inventario asociado' 
      });
    }
    
    const [result] = await pool.query(
      'DELETE FROM bodegas WHERE id_bodega = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Bodega no encontrada' });
    }
    
    res.json({ success: true, message: 'Bodega eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar bodega:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar bodega' });
  }
});

// Agregar medicamento al inventario de una bodega
router.post('/:id/inventario', async (req, res) => {
  const { id_medicamento, cantidad, fecha_asignacion } = req.body;
  
  if (!id_medicamento || !cantidad) {
    return res.status(400).json({ 
      success: false, 
      message: 'El ID del medicamento y la cantidad son requeridos' 
    });
  }
  
  try {
    // Verificar si el medicamento ya existe en el inventario de esta bodega
    const [existente] = await pool.query(
      'SELECT id_inventario FROM inventario_bodega WHERE id_bodega = ? AND id_medicamento = ?',
      [req.params.id, id_medicamento]
    );
    
    if (existente.length > 0) {
      // Actualizar cantidad si ya existe
      await pool.query(
        `UPDATE inventario_bodega 
         SET cantidad = cantidad + ?, 
             fecha_asignacion = ?, 
             updated_at = NOW()
         WHERE id_bodega = ? AND id_medicamento = ?`,
        [cantidad, fecha_asignacion || new Date().toISOString().split('T')[0], req.params.id, id_medicamento]
      );
      
      res.json({ 
        success: true, 
        message: 'Inventario actualizado exitosamente',
        data: { id_inventario: existente[0].id_inventario }
      });
    } else {
      // Insertar nuevo registro si no existe
      const [result] = await pool.query(
        `INSERT INTO inventario_bodega 
         (id_bodega, id_medicamento, cantidad, fecha_asignacion, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [
          req.params.id, 
          id_medicamento, 
          cantidad, 
          fecha_asignacion || new Date().toISOString().split('T')[0]
        ]
      );
      
      res.status(201).json({ 
        success: true, 
        message: 'Medicamento agregado al inventario exitosamente',
        data: { id_inventario: result.insertId }
      });
    }
  } catch (error) {
    console.error('Error al agregar medicamento al inventario:', error);
    res.status(500).json({ success: false, message: 'Error al agregar medicamento al inventario' });
  }
});

// Actualizar cantidad de medicamento en inventario
router.put('/:id_bodega/inventario/:id_medicamento', async (req, res) => {
  const { cantidad, fecha_asignacion } = req.body;
  
  if (cantidad === undefined) {
    return res.status(400).json({ success: false, message: 'La cantidad es requerida' });
  }
  
  try {
    const [result] = await pool.query(
      `UPDATE inventario_bodega 
       SET cantidad = ?, 
           fecha_asignacion = COALESCE(?, fecha_asignacion), 
           updated_at = NOW()
       WHERE id_bodega = ? AND id_medicamento = ?`,
      [
        cantidad, 
        fecha_asignacion || null, 
        req.params.id_bodega, 
        req.params.id_medicamento
      ]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medicamento no encontrado en el inventario de esta bodega' 
      });
    }
    
    res.json({ success: true, message: 'Inventario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar inventario:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar inventario' });
  }
});

// Eliminar medicamento del inventario
router.delete('/:id_bodega/inventario/:id_medicamento', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM inventario_bodega WHERE id_bodega = ? AND id_medicamento = ?',
      [req.params.id_bodega, req.params.id_medicamento]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medicamento no encontrado en el inventario de esta bodega' 
      });
    }
    
    res.json({ success: true, message: 'Medicamento eliminado del inventario exitosamente' });
  } catch (error) {
    console.error('Error al eliminar medicamento del inventario:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar medicamento del inventario' });
  }
});

// Endpoint de prueba para bodegas (fallback)
router.get('/test', async (req, res) => {
  try {
    // Return static test data
    const testBodegas = [
      {
        id_bodega: 1,
        id_user: 1,
        nombre_bodega: "Bodega Central",
        descripcion: "Bodega principal de medicamentos",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id_bodega: 2,
        id_user: 2,
        nombre_bodega: "Bodega Norte",
        descripcion: "Sucursal norte",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    res.json({ success: true, data: testBodegas });
  } catch (error) {
    console.error('Error en endpoint de prueba:', error);
    res.status(500).json({ success: false, message: 'Error en endpoint de prueba' });
  }
});

module.exports = router;
