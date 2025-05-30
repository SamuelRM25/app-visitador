const { pool } = require('../config/db');

class Departamento {
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Departamento WHERE id_departamento = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Error al buscar departamento: ${error.message}`);
    }
  }

  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Departamento ORDER BY nombre_departamento'
      );
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener departamentos: ${error.message}`);
    }
  }

  static async create(departamentoData) {
    const { nombre_departamento } = departamentoData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO Departamento (nombre_departamento) VALUES (?)',
        [nombre_departamento]
      );
      
      return { id_departamento: result.insertId, nombre_departamento };
    } catch (error) {
      throw new Error(`Error al crear departamento: ${error.message}`);
    }
  }

  static async update(id, departamentoData) {
    const { nombre_departamento } = departamentoData;
    
    try {
      const [result] = await pool.execute(
        'UPDATE Departamento SET nombre_departamento = ? WHERE id_departamento = ?',
        [nombre_departamento, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al actualizar departamento: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM Departamento WHERE id_departamento = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al eliminar departamento: ${error.message}`);
    }
  }
}

module.exports = Departamento;