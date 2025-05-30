const { pool } = require('../config/db');

exports.getAllBodegas = async (req, res) => {
  try {
    const [bodegas] = await pool.execute(
      'SELECT * FROM Bodegas WHERE activo = TRUE ORDER BY nombre_bodega'
    );
    
    res.status(200).json({
      success: true,
      data: bodegas
    });
  } catch (error) {
    console.error('Error al obtener bodegas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener bodegas',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.getBodegaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [bodegas] = await pool.execute(
      'SELECT * FROM Bodegas WHERE id_bodega = ? AND activo = TRUE',
      [id]
    );
    
    if (bodegas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bodega no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      data: bodegas[0]
    });
  } catch (error) {
    console.error('Error al obtener bodega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener bodega',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.createBodega = async (req, res) => {
  try {
    const { nombre_bodega, direccion_bodega } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO Bodegas (nombre_bodega, direccion_bodega) VALUES (?, ?)',
      [nombre_bodega, direccion_bodega]
    );
    
    res.status(201).json({
      success: true,
      message: 'Bodega creada exitosamente',
      data: { id_bodega: result.insertId, nombre_bodega, direccion_bodega }
    });
  } catch (error) {
    console.error('Error al crear bodega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear bodega',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.updateBodega = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_bodega, direccion_bodega } = req.body;
    
    // Verificar si la bodega existe
    const [bodegas] = await pool.execute(
      'SELECT * FROM Bodegas WHERE id_bodega = ? AND activo = TRUE',
      [id]
    );
    
    if (bodegas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bodega no encontrada'
      });
    }
    
    // Actualizar bodega
    const [result] = await pool.execute(
      'UPDATE Bodegas SET nombre_bodega = ?, direccion_bodega = ? WHERE id_bodega = ?',
      [nombre_bodega, direccion_bodega, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo actualizar la bodega'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Bodega actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar bodega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar bodega',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.deactivateBodega = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si la bodega existe
    const [bodegas] = await pool.execute(
      'SELECT * FROM Bodegas WHERE id_bodega = ? AND activo = TRUE',
      [id]
    );
    
    if (bodegas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bodega no encontrada'
      });
    }
    
    // Desactivar bodega
    const [result] = await pool.execute(
      'UPDATE Bodegas SET activo = FALSE WHERE id_bodega = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo desactivar la bodega'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Bodega desactivada exitosamente'
    });
  } catch (error) {
    console.error('Error al desactivar bodega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar bodega',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};