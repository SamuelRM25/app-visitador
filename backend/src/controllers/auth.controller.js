const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');
require('dotenv').config();

exports.login = async (req, res) => {
  try {
    const { usuario, password } = req.body;
    
    // Verificar si el usuario existe
    const user = await Usuario.findByUsername(usuario);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Verificar contraseña
    const isPasswordValid = await Usuario.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { id: user.id_usuario, usuario: user.usuario },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        id: user.id_usuario,
        usuario: user.usuario,
        nombre: user.nombre_usuario,
        token
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.register = async (req, res) => {
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
      message: 'Usuario registrado exitosamente',
      data: newUser
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await Usuario.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil de usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Verificar usuario
    const user = await Usuario.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar contraseña actual
    const isPasswordValid = await Usuario.comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }
    
    // Cambiar contraseña
    await Usuario.changePassword(userId, newPassword);
    
    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};