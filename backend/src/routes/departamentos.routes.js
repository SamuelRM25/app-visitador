const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');

// Importar controlador
const departamentosController = require('../controllers/departamentos.controller');

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get('/', departamentosController.getAllDepartamentos);
router.get('/:id', departamentosController.getDepartamentoById);
router.post('/', departamentosController.createDepartamento);
router.put('/:id', departamentosController.updateDepartamento);
router.delete('/:id', departamentosController.deactivateDepartamento);

module.exports = router;