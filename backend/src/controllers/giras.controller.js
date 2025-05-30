const { pool } = require('../config/db');

exports.getAllGiras = async (req, res) => {
  try {
    const [giras] = await pool.execute(
      `SELECT g.*, u.nombre_usuario 
      FROM Giras g 
      JOIN Usuarios u ON g.id_usuario = u.id_usuario 
      ORDER BY g.fecha_inicio DESC`
    );
    
    res.status(200).json({
      success: true,
      data: giras
    });
  } catch (error) {
    console.error('Error al obtener giras:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener giras',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.getGiraById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener información de la gira
    const [giras] = await pool.execute(
      `SELECT g.*, u.nombre_usuario 
      FROM Giras g 
      JOIN Usuarios u ON g.id_usuario = u.id_usuario 
      WHERE g.id_gira = ?`,
      [id]
    );
    
    if (giras.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gira no encontrada'
      });
    }
    
    // Obtener municipios de la gira
    const [municipios] = await pool.execute(
      `SELECT gm.*, m.nombre_municipio, d.nombre_departamento 
      FROM Gira_Municipio gm 
      JOIN Municipio m ON gm.id_municipio = m.id_municipio 
      JOIN Departamento d ON m.id_departamento = d.id_departamento 
      WHERE gm.id_gira = ?`,
      [id]
    );
    
    res.status(200).json({
      success: true,
      data: {
        ...giras[0],
        municipios
      }
    });
  } catch (error) {
    console.error('Error al obtener gira:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener gira',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.getGirasByUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    
    const [giras] = await pool.execute(
      `SELECT g.*, u.nombre_usuario 
      FROM Giras g 
      JOIN Usuarios u ON g.id_usuario = u.id_usuario 
      WHERE g.id_usuario = ? 
      ORDER BY g.fecha_inicio DESC`,
      [id_usuario]
    );
    
    res.status(200).json({
      success: true,
      data: giras
    });
  } catch (error) {
    console.error('Error al obtener giras por usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener giras por usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.createGira = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { nombre_gira, fecha_inicio, fecha_fin, municipios } = req.body;
    const id_usuario = req.user.id;
    
    // Crear gira
    const [resultGira] = await connection.execute(
      'INSERT INTO Giras (nombre_gira, fecha_inicio, fecha_fin, id_usuario) VALUES (?, ?, ?, ?)',
      [nombre_gira, fecha_inicio, fecha_fin, id_usuario]
    );
    
    const id_gira = resultGira.insertId;
    
    // Agregar municipios a la gira si se proporcionan
    if (municipios && municipios.length > 0) {
      for (const id_municipio of municipios) {
        await connection.execute(
          'INSERT INTO Gira_Municipio (id_gira, id_municipio) VALUES (?, ?)',
          [id_gira, id_municipio]
        );
      }
    }
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Gira creada exitosamente',
      data: { id_gira }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear gira:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear gira',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  } finally {
    connection.release();
  }
};

exports.updateGira = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_gira, fecha_inicio, fecha_fin } = req.body;
    
    // Verificar si la gira existe
    const [giras] = await pool.execute(
      'SELECT * FROM Giras WHERE id_gira = ?',
      [id]
    );
    
    if (giras.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gira no encontrada'
      });
    }
    
    // Actualizar gira
    const [result] = await pool.execute(
      'UPDATE Giras SET nombre_gira = ?, fecha_inicio = ?, fecha_fin = ? WHERE id_gira = ?',
      [nombre_gira, fecha_inicio, fecha_fin, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo actualizar la gira'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Gira actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar gira:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar gira',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.deleteGira = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    // Verificar si la gira existe
    const [giras] = await connection.execute(
      'SELECT * FROM Giras WHERE id_gira = ?',
      [id]
    );
    
    if (giras.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Gira no encontrada'
      });
    }
    
    // Eliminar municipios de la gira
    await connection.execute(
      'DELETE FROM Gira_Municipio WHERE id_gira = ?',
      [id]
    );
    
    // Eliminar gira
    const [result] = await connection.execute(
      'DELETE FROM Giras WHERE id_gira = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'No se pudo eliminar la gira'
      });
    }
    
    await connection.commit();
    
    res.status(200).json({
      success: true,
      message: 'Gira eliminada exitosamente'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar gira:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar gira',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  } finally {
    connection.release();
  }
};

exports.addMunicipioToGira = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_municipio } = req.body;
    
    // Verificar si la gira existe
    const [giras] = await pool.execute(
      'SELECT * FROM Giras WHERE id_gira = ?',
      [id]
    );
    
    if (giras.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gira no encontrada'
      });
    }
    
    // Verificar si el municipio ya está en la gira
    const [existingMunicipio] = await pool.execute(
      'SELECT * FROM Gira_Municipio WHERE id_gira = ? AND id_municipio = ?',
      [id, id_municipio]
    );
    
    if (existingMunicipio.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El municipio ya está asignado a esta gira'
      });
    }
    
    // Agregar municipio a la gira
    await pool.execute(
      'INSERT INTO Gira_Municipio (id_gira, id_municipio) VALUES (?, ?)',
      [id, id_municipio]
    );
    
    res.status(201).json({
      success: true,
      message: 'Municipio agregado a la gira exitosamente'
    });
  } catch (error) {
    console.error('Error al agregar municipio a la gira:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar municipio a la gira',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.removeMunicipioFromGira = async (req, res) => {
  try {
    const { id_gira, id_municipio } = req.params;
    
    // Verificar si la relación existe
    const [giraMunicipio] = await pool.execute(
      'SELECT * FROM Gira_Municipio WHERE id_gira = ? AND id_municipio = ?',
      [id_gira, id_municipio]
    );
    
    if (giraMunicipio.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'El municipio no está asignado a esta gira'
      });
    }
    
    // Eliminar municipio de la gira
    const [result] = await pool.execute(
      'DELETE FROM Gira_Municipio WHERE id_gira = ? AND id_municipio = ?',
      [id_gira, id_municipio]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo eliminar el municipio de la gira'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Municipio eliminado de la gira exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar municipio de la gira:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar municipio de la gira',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};