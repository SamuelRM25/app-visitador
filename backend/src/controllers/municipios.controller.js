const Municipio = require('../models/municipio.model');

exports.getAllMunicipios = async (req, res) => {
  try {
    const municipios = await Municipio.getAll();
    res.status(200).json({
      success: true,
      data: municipios
    });
  } catch (error) {
    console.error('Error al obtener municipios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener municipios',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.getMunicipioById = async (req, res) => {
  try {
    const { id } = req.params;
    const municipio = await Municipio.findById(id);
    
    if (!municipio) {
      return res.status(404).json({
        success: false,
        message: 'Municipio no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: municipio
    });
  } catch (error) {
    console.error('Error al obtener municipio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener municipio',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.getMunicipiosByDepartamento = async (req, res) => {
  try {
    const { id_departamento } = req.params;
    const municipios = await Municipio.getByDepartamento(id_departamento);
    
    res.status(200).json({
      success: true,
      data: municipios
    });
  } catch (error) {
    console.error('Error al obtener municipios por departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener municipios por departamento',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.createMunicipio = async (req, res) => {
  try {
    const { nombre_municipio, id_departamento } = req.body;
    
    // Crear nuevo municipio
    const newMunicipio = await Municipio.create({
      nombre_municipio,
      id_departamento
    });
    
    res.status(201).json({
      success: true,
      message: 'Municipio creado exitosamente',
      data: newMunicipio
    });
  } catch (error) {
    console.error('Error al crear municipio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear municipio',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.updateMunicipio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_municipio, id_departamento } = req.body;
    
    // Verificar si el municipio existe
    const municipio = await Municipio.findById(id);
    if (!municipio) {
      return res.status(404).json({
        success: false,
        message: 'Municipio no encontrado'
      });
    }
    
    // Actualizar municipio
    const updated = await Municipio.update(id, {
      nombre_municipio,
      id_departamento
    });
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo actualizar el municipio'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Municipio actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar municipio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar municipio',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.deactivateMunicipio = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el municipio existe
    const municipio = await Municipio.findById(id);
    if (!municipio) {
      return res.status(404).json({
        success: false,
        message: 'Municipio no encontrado'
      });
    }
    
    // Eliminar municipio
    const deleted = await Municipio.delete(id);
    
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo eliminar el municipio'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Municipio eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar municipio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar municipio',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};