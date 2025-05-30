const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');

// Importar controlador (lo crearemos después)
const usuariosController = require('../controllers/usuarios.controller');

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get('/', usuariosController.getAllUsuarios);
router.get('/:id', usuariosController.getUsuarioById);
router.post('/', usuariosController.createUsuario);
router.put('/:id', usuariosController.updateUsuario);
router.delete('/:id', usuariosController.deactivateUsuario);

module.exports = router;