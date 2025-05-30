const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');

// Importar controlador
const medicamentosController = require('../controllers/medicamentos.controller');

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get('/', medicamentosController.getAllMedicamentos);
router.get('/search', medicamentosController.searchMedicamentos);
router.get('/:id', medicamentosController.getMedicamentoById);
router.post('/', medicamentosController.createMedicamento);
router.put('/:id', medicamentosController.updateMedicamento);
router.delete('/:id', medicamentosController.deactivateMedicamento);

module.exports = router;