const Departamento = require('../models/departamento.model');

exports.getAllDepartamentos = async (req, res) => {
  try {
    const departamentos = await Departamento.getAll();
    res.status(200).json({
      success: true,
      data: departamentos
    });
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener departamentos',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.getDepartamentoById = async (req, res) => {
  try {
    const { id } = req.params;
    const departamento = await Departamento.findById(id);
    
    if (!departamento) {
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: departamento
    });
  } catch (error) {
    console.error('Error al obtener departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener departamento',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.createDepartamento = async (req, res) => {
  try {
    const { nombre_departamento } = req.body;
    
    // Crear nuevo departamento
    const newDepartamento = await Departamento.create({
      nombre_departamento
    });
    
    res.status(201).json({
      success: true,
      message: 'Departamento creado exitosamente',
      data: newDepartamento
    });
  } catch (error) {
    console.error('Error al crear departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear departamento',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.updateDepartamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_departamento } = req.body;
    
    // Verificar si el departamento existe
    const departamento = await Departamento.findById(id);
    if (!departamento) {
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }
    
    // Actualizar departamento
    const updated = await Departamento.update(id, {
      nombre_departamento
    });
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo actualizar el departamento'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Departamento actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar departamento',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.deactivateDepartamento = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el departamento existe
    const departamento = await Departamento.findById(id);
    if (!departamento) {
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }
    
    // Eliminar departamento
    const deleted = await Departamento.delete(id);
    
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo eliminar el departamento'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Departamento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar departamento',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};