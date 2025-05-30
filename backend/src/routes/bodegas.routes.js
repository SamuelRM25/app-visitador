const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');

// Importar controlador
const bodegasController = require('../controllers/bodegas.controller');

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get('/', bodegasController.getAllBodegas);
router.get('/:id', bodegasController.getBodegaById);
router.post('/', bodegasController.createBodega);
router.put('/:id', bodegasController.updateBodega);
router.delete('/:id', bodegasController.deactivateBodega);

module.exports = router;