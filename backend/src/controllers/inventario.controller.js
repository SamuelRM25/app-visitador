const { pool } = require('../config/db');

exports.getAllInventario = async (req, res) => {
  try {
    const [inventario] = await pool.execute(
      `SELECT i.*, m.nombre_medicamento, m.presentacion_medicamento, b.nombre_bodega 
      FROM Inventario_Bodega i 
      JOIN Medicamento m ON i.id_medicamento = m.id_medicamento 
      JOIN Bodegas b ON i.id_bodega = b.id_bodega 
      WHERE i.cantidad_medicamento > 0`
    );
    
    res.status(200).json({
      success: true,
      data: inventario
    });
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener inventario',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.getInventarioById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [inventario] = await pool.execute(
      `SELECT i.*, m.nombre_medicamento, m.presentacion_medicamento, b.nombre_bodega 
      FROM Inventario_Bodega i 
      JOIN Medicamento m ON i.id_medicamento = m.id_medicamento 
      JOIN Bodegas b ON i.id_bodega = b.id_bodega 
      WHERE i.id_inventario = ?`,
      [id]
    );
    
    if (inventario.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: inventario[0]
    });
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener inventario',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.getInventarioByBodega = async (req, res) => {
  try {
    const { id_bodega } = req.params;
    
    const [inventario] = await pool.execute(
      `SELECT i.*, m.nombre_medicamento, m.presentacion_medicamento 
      FROM Inventario_Bodega i 
      JOIN Medicamento m ON i.id_medicamento = m.id_medicamento 
      WHERE i.id_bodega = ?`,
      [id_bodega]
    );
    
    res.status(200).json({
      success: true,
      data: inventario
    });
  } catch (error) {
    console.error('Error al obtener inventario por bodega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener inventario por bodega',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.getInventarioByMedicamento = async (req, res) => {
  try {
    const { id_medicamento } = req.params;
    
    const [inventario] = await pool.execute(
      `SELECT i.*, b.nombre_bodega 
      FROM Inventario_Bodega i 
      JOIN Bodegas b ON i.id_bodega = b.id_bodega 
      WHERE i.id_medicamento = ?`,
      [id_medicamento]
    );
    
    res.status(200).json({
      success: true,
      data: inventario
    });
  } catch (error) {
    console.error('Error al obtener inventario por medicamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener inventario por medicamento',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.createInventario = async (req, res) => {
  try {
    const { id_bodega, id_medicamento, cantidad_medicamento } = req.body;
    
    // Verificar si ya existe un registro para este medicamento en esta bodega
    const [existingInventario] = await pool.execute(
      'SELECT * FROM Inventario_Bodega WHERE id_bodega = ? AND id_medicamento = ?',
      [id_bodega, id_medicamento]
    );
    
    if (existingInventario.length > 0) {
      // Actualizar inventario existente
      const [result] = await pool.execute(
        'UPDATE Inventario_Bodega SET cantidad_medicamento = cantidad_medicamento + ? WHERE id_bodega = ? AND id_medicamento = ?',
        [cantidad_medicamento, id_bodega, id_medicamento]
      );
      
      return res.status(200).json({
        success: true,
        message: 'Inventario actualizado exitosamente',
        data: { id_inventario: existingInventario[0].id_inventario }
      });
    }
    
    // Crear nuevo registro de inventario
    const [result] = await pool.execute(
      'INSERT INTO Inventario_Bodega (id_bodega, id_medicamento, cantidad_medicamento) VALUES (?, ?, ?)',
      [id_bodega, id_medicamento, cantidad_medicamento]
    );
    
    res.status(201).json({
      success: true,
      message: 'Inventario creado exitosamente',
      data: { id_inventario: result.insertId }
    });
  } catch (error) {
    console.error('Error al crear inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear inventario',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.updateInventario = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad_medicamento } = req.body;
    
    // Verificar si el inventario existe
    const [inventario] = await pool.execute(
      'SELECT * FROM Inventario_Bodega WHERE id_inventario = ?',
      [id]
    );
    
    if (inventario.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventario no encontrado'
      });
    }
    
    // Actualizar inventario
    const [result] = await pool.execute(
      'UPDATE Inventario_Bodega SET cantidad_medicamento = ? WHERE id_inventario = ?',
      [cantidad_medicamento, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo actualizar el inventario'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Inventario actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar inventario',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.deleteInventario = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el inventario existe
    const [inventario] = await pool.execute(
      'SELECT * FROM Inventario_Bodega WHERE id_inventario = ?',
      [id]
    );
    
    if (inventario.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventario no encontrado'
      });
    }
    
    // Eliminar inventario
    const [result] = await pool.execute(
      'DELETE FROM Inventario_Bodega WHERE id_inventario = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo eliminar el inventario'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Inventario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar inventario',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};