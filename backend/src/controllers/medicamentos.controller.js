const Medicamento = require('../models/medicamento.model');

exports.getAllMedicamentos = async (req, res) => {
  try {
    const medicamentos = await Medicamento.getAll();
    res.status(200).json({
      success: true,
      data: medicamentos
    });
  } catch (error) {
    console.error('Error al obtener medicamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener medicamentos',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.getMedicamentoById = async (req, res) => {
  try {
    const { id } = req.params;
    const medicamento = await Medicamento.findById(id);
    
    if (!medicamento) {
      return res.status(404).json({
        success: false,
        message: 'Medicamento no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: medicamento
    });
  } catch (error) {
    console.error('Error al obtener medicamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener medicamento',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.createMedicamento = async (req, res) => {
  try {
    const { id_medicamento, nombre_medicamento, molecula_medicamento, presentacion_medicamento, precio_medicamento } = req.body;
    
    // Verificar si el medicamento ya existe
    const existingMedicamento = await Medicamento.findById(id_medicamento);
    if (existingMedicamento) {
      return res.status(400).json({
        success: false,
        message: 'El medicamento ya existe'
      });
    }
    
    // Crear nuevo medicamento
    const newMedicamento = await Medicamento.create({
      id_medicamento,
      nombre_medicamento,
      molecula_medicamento,
      presentacion_medicamento,
      precio_medicamento
    });
    
    res.status(201).json({
      success: true,
      message: 'Medicamento creado exitosamente',
      data: newMedicamento
    });
  } catch (error) {
    console.error('Error al crear medicamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear medicamento',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.updateMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_medicamento, molecula_medicamento, presentacion_medicamento, precio_medicamento } = req.body;
    
    // Verificar si el medicamento existe
    const medicamento = await Medicamento.findById(id);
    if (!medicamento) {
      return res.status(404).json({
        success: false,
        message: 'Medicamento no encontrado'
      });
    }
    
    // Actualizar medicamento
    const updated = await Medicamento.update(id, {
      nombre_medicamento,
      molecula_medicamento,
      presentacion_medicamento,
      precio_medicamento
    });
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo actualizar el medicamento'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Medicamento actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar medicamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar medicamento',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.deactivateMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el medicamento existe
    const medicamento = await Medicamento.findById(id);
    if (!medicamento) {
      return res.status(404).json({
        success: false,
        message: 'Medicamento no encontrado'
      });
    }
    
    // Desactivar medicamento
    const deactivated = await Medicamento.deactivate(id);
    
    if (!deactivated) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo desactivar el medicamento'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Medicamento desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error al desactivar medicamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar medicamento',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.searchMedicamentos = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un término de búsqueda'
      });
    }
    
    const medicamentos = await Medicamento.search(q);
    
    res.status(200).json({
      success: true,
      data: medicamentos
    });
  } catch (error) {
    console.error('Error al buscar medicamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar medicamentos',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};