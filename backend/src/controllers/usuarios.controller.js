const Usuario = require('../models/usuario.model');

exports.getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.getAll();
    res.status(200).json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.createUsuario = async (req, res) => {
  try {
    const { usuario, password, nombre_usuario, telefono_usuario } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await Usuario.findByUsername(usuario);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario ya está en uso'
      });
    }
    
    // Crear nuevo usuario
    const newUser = await Usuario.create({
      usuario,
      password,
      nombre_usuario,
      telefono_usuario
    });
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: newUser
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_usuario, telefono_usuario } = req.body;
    
    // Verificar si el usuario existe
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Actualizar usuario
    const updated = await Usuario.update(id, {
      nombre_usuario,
      telefono_usuario
    });
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo actualizar el usuario'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.deactivateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el usuario existe
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Desactivar usuario
    const deactivated = await Usuario.deactivate(id);
    
    if (!deactivated) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo desactivar el usuario'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Usuario desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};