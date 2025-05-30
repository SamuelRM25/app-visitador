const { pool } = require('../config/db');

class Medicamento {
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Medicamento WHERE id_medicamento = ? AND activo = TRUE',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Error al buscar medicamento: ${error.message}`);
    }
  }

  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Medicamento WHERE activo = TRUE'
      );
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener medicamentos: ${error.message}`);
    }
  }

  static async create(medicamentoData) {
    const { id_medicamento, nombre_medicamento, molecula_medicamento, presentacion_medicamento, precio_medicamento } = medicamentoData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO Medicamento (id_medicamento, nombre_medicamento, molecula_medicamento, presentacion_medicamento, precio_medicamento) VALUES (?, ?, ?, ?, ?)',
        [id_medicamento, nombre_medicamento, molecula_medicamento, presentacion_medicamento, precio_medicamento]
      );
      
      return { id_medicamento, nombre_medicamento, molecula_medicamento, presentacion_medicamento, precio_medicamento };
    } catch (error) {
      throw new Error(`Error al crear medicamento: ${error.message}`);
    }
  }

  static async update(id, medicamentoData) {
    const { nombre_medicamento, molecula_medicamento, presentacion_medicamento, precio_medicamento } = medicamentoData;
    
    try {
      // Obtener precio anterior para historial
      const [oldPrice] = await pool.execute(
        'SELECT precio_medicamento FROM Medicamento WHERE id_medicamento = ?',
        [id]
      );
      
      const [result] = await pool.execute(
        'UPDATE Medicamento SET nombre_medicamento = ?, molecula_medicamento = ?, presentacion_medicamento = ?, precio_medicamento = ? WHERE id_medicamento = ?',
        [nombre_medicamento, molecula_medicamento, presentacion_medicamento, precio_medicamento, id]
      );
      
      // El trigger se encargará de registrar el cambio de precio
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al actualizar medicamento: ${error.message}`);
    }
  }

  static async deactivate(id) {
    try {
      const [result] = await pool.execute(
        'UPDATE Medicamento SET activo = FALSE WHERE id_medicamento = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al desactivar medicamento: ${error.message}`);
    }
  }

  static async search(query) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Medicamento WHERE (nombre_medicamento LIKE ? OR molecula_medicamento LIKE ?) AND activo = TRUE',
        [`%${query}%`, `%${query}%`]
      );
      return rows;
    } catch (error) {
      throw new Error(`Error al buscar medicamentos: ${error.message}`);
    }
  }
}

module.exports = Medicamento;