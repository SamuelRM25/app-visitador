const { pool } = require('../config/db');

class Municipio {
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT m.*, d.nombre_departamento FROM Municipio m JOIN Departamento d ON m.id_departamento = d.id_departamento WHERE m.id_municipio = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Error al buscar municipio: ${error.message}`);
    }
  }

  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT m.*, d.nombre_departamento FROM Municipio m JOIN Departamento d ON m.id_departamento = d.id_departamento ORDER BY d.nombre_departamento, m.nombre_municipio'
      );
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener municipios: ${error.message}`);
    }
  }

  static async getByDepartamento(id_departamento) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Municipio WHERE id_departamento = ? ORDER BY nombre_municipio',
        [id_departamento]
      );
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener municipios por departamento: ${error.message}`);
    }
  }

  static async create(municipioData) {
    const { nombre_municipio, id_departamento } = municipioData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO Municipio (nombre_municipio, id_departamento) VALUES (?, ?)',
        [nombre_municipio, id_departamento]
      );
      
      return { id_municipio: result.insertId, nombre_municipio, id_departamento };
    } catch (error) {
      throw new Error(`Error al crear municipio: ${error.message}`);
    }
  }

  static async update(id, municipioData) {
    const { nombre_municipio, id_departamento } = municipioData;
    
    try {
      const [result] = await pool.execute(
        'UPDATE Municipio SET nombre_municipio = ?, id_departamento = ? WHERE id_municipio = ?',
        [nombre_municipio, id_departamento, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al actualizar municipio: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM Municipio WHERE id_municipio = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al eliminar municipio: ${error.message}`);
    }
  }
}

module.exports = Municipio;