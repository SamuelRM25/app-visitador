const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');

// Importar controlador
const inventarioController = require('../controllers/inventario.controller');

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get('/', inventarioController.getAllInventario);
router.get('/bodega/:id_bodega', inventarioController.getInventarioByBodega);
router.get('/medicamento/:id_medicamento', inventarioController.getInventarioByMedicamento);
router.get('/:id', inventarioController.getInventarioById);
router.post('/', inventarioController.createInventario);
router.put('/:id', inventarioController.updateInventario);
router.delete('/:id', inventarioController.deleteInventario);

module.exports = router;