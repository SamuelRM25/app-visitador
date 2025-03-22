const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  console.log('Intento de login:', username);
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Usuario y contraseña son requeridos' 
    });
  }
  
  try {
    // Buscar usuario por nombre de usuario
    const [users] = await pool.query(
      'SELECT * FROM usuarios WHERE us_user = ?', 
      [username]
    );
    
    if (users.length === 0) {
      console.log('Usuario no encontrado:', username);
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
    }
    
    const user = users[0];
    console.log('Usuario encontrado:', username);
    
    // Comparación directa de contraseñas (para desarrollo)
    const passwordMatch = (password === user.pass_user);
    
    if (!passwordMatch) {
      console.log('Contraseña incorrecta para usuario:', username);
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
    }
    
    console.log('Login exitoso para:', username);
    
    // Eliminar la contraseña del objeto usuario antes de enviarlo
    const { pass_user, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al procesar la solicitud' 
    });
  }
});

module.exports = router;