const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');

// Importar controlador
const clientesController = require('../controllers/clientes.controller');

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get('/', clientesController.getAllClientes);
router.get('/municipio/:id_municipio', clientesController.getClientesByMunicipio);
router.get('/search', clientesController.searchClientes);
router.get('/:id', clientesController.getClienteById);
router.post('/', clientesController.createCliente);
router.put('/:id', clientesController.updateCliente);
router.delete('/:id', clientesController.deactivateCliente);

module.exports = router;