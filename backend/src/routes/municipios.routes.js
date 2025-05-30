const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');

// Importar controlador
const municipiosController = require('../controllers/municipios.controller');

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get('/', municipiosController.getAllMunicipios);
router.get('/departamento/:id_departamento', municipiosController.getMunicipiosByDepartamento);
router.get('/:id', municipiosController.getMunicipioById);
router.post('/', municipiosController.createMunicipio);
router.put('/:id', municipiosController.updateMunicipio);
router.delete('/:id', municipiosController.deactivateMunicipio);

module.exports = router;