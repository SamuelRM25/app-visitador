const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class Usuario {
  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Usuarios WHERE usuario = ? AND activo = TRUE',
        [username]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id_usuario, usuario, nombre_usuario, telefono_usuario, fecha_creacion FROM Usuarios WHERE id_usuario = ? AND activo = TRUE',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Error al buscar usuario por ID: ${error.message}`);
    }
  }

  static async create(userData) {
    const { usuario, password, nombre_usuario, telefono_usuario } = userData;
    
    try {
      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const [result] = await pool.execute(
        'INSERT INTO Usuarios (usuario, password, nombre_usuario, telefono_usuario) VALUES (?, ?, ?, ?)',
        [usuario, hashedPassword, nombre_usuario, telefono_usuario]
      );
      
      return { id: result.insertId, usuario, nombre_usuario, telefono_usuario };
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  static async update(id, userData) {
    const { nombre_usuario, telefono_usuario } = userData;
    
    try {
      const [result] = await pool.execute(
        'UPDATE Usuarios SET nombre_usuario = ?, telefono_usuario = ? WHERE id_usuario = ?',
        [nombre_usuario, telefono_usuario, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  static async changePassword(id, newPassword) {
    try {
      // Encriptar nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      const [result] = await pool.execute(
        'UPDATE Usuarios SET password = ? WHERE id_usuario = ?',
        [hashedPassword, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al cambiar contraseña: ${error.message}`);
    }
  }

  static async deactivate(id) {
    try {
      const [result] = await pool.execute(
        'UPDATE Usuarios SET activo = FALSE WHERE id_usuario = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al desactivar usuario: ${error.message}`);
    }
  }

  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT id_usuario, usuario, nombre_usuario, telefono_usuario, fecha_creacion FROM Usuarios WHERE activo = TRUE'
      );
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = Usuario;