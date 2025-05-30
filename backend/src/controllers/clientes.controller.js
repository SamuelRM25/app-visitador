const { pool } = require('../config/db');

exports.getAllClientes = async (req, res) => {
  try {
    const [clientes] = await pool.execute(
      `SELECT c.*, m.nombre_municipio, d.nombre_departamento 
      FROM Clientes c 
      JOIN Municipio m ON c.id_municipio = m.id_municipio 
      JOIN Departamento d ON m.id_departamento = d.id_departamento 
      WHERE c.activo = TRUE 
      ORDER BY c.nombre_cliente`
    );
    
    res.status(200).json({
      success: true,
      data: clientes
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [clientes] = await pool.execute(
      `SELECT c.*, m.nombre_municipio, d.nombre_departamento 
      FROM Clientes c 
      JOIN Municipio m ON c.id_municipio = m.id_municipio 
      JOIN Departamento d ON m.id_departamento = d.id_departamento 
      WHERE c.id_cliente = ? AND c.activo = TRUE`,
      [id]
    );
    
    if (clientes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: clientes[0]
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.getClientesByMunicipio = async (req, res) => {
  try {
    const { id_municipio } = req.params;
    
    const [clientes] = await pool.execute(
      `SELECT c.*, m.nombre_municipio 
      FROM Clientes c 
      JOIN Municipio m ON c.id_municipio = m.id_municipio 
      WHERE c.id_municipio = ? AND c.activo = TRUE 
      ORDER BY c.nombre_cliente`,
      [id_municipio]
    );
    
    res.status(200).json({
      success: true,
      data: clientes
    });
  } catch (error) {
    console.error('Error al obtener clientes por municipio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes por municipio',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.searchClientes = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un término de búsqueda'
      });
    }
    
    const [clientes] = await pool.execute(
      `SELECT c.*, m.nombre_municipio, d.nombre_departamento 
      FROM Clientes c 
      JOIN Municipio m ON c.id_municipio = m.id_municipio 
      JOIN Departamento d ON m.id_departamento = d.id_departamento 
      WHERE (c.nombre_cliente LIKE ? OR c.telefono_cliente LIKE ?) AND c.activo = TRUE 
      ORDER BY c.nombre_cliente`,
      [`%${q}%`, `%${q}%`]
    );
    
    res.status(200).json({
      success: true,
      data: clientes
    });
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar clientes',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.createCliente = async (req, res) => {
  try {
    const { nombre_cliente, telefono_cliente, direccion_cliente, id_municipio } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO Clientes (nombre_cliente, telefono_cliente, direccion_cliente, id_municipio) VALUES (?, ?, ?, ?)',
      [nombre_cliente, telefono_cliente, direccion_cliente, id_municipio]
    );
    
    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: { 
        id_cliente: result.insertId, 
        nombre_cliente, 
        telefono_cliente, 
        direccion_cliente, 
        id_municipio 
      }
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_cliente, telefono_cliente, direccion_cliente, id_municipio } = req.body;
    
    // Verificar si el cliente existe
    const [clientes] = await pool.execute(
      'SELECT * FROM Clientes WHERE id_cliente = ? AND activo = TRUE',
      [id]
    );
    
    if (clientes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    // Actualizar cliente
    const [result] = await pool.execute(
      'UPDATE Clientes SET nombre_cliente = ?, telefono_cliente = ?, direccion_cliente = ?, id_municipio = ? WHERE id_cliente = ?',
      [nombre_cliente, telefono_cliente, direccion_cliente, id_municipio, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo actualizar el cliente'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Cliente actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.deactivateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el cliente existe
    const [clientes] = await pool.execute(
      'SELECT * FROM Clientes WHERE id_cliente = ? AND activo = TRUE',
      [id]
    );
    
    if (clientes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    // Desactivar cliente
    const [result] = await pool.execute(
      'UPDATE Clientes SET activo = FALSE WHERE id_cliente = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo desactivar el cliente'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Cliente desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error al desactivar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};