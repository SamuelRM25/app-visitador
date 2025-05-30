const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');

// Importar controlador
const girasController = require('../controllers/giras.controller');

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get('/', girasController.getAllGiras);
router.get('/usuario/:id_usuario', girasController.getGirasByUsuario);
router.get('/:id', girasController.getGiraById);
router.post('/', girasController.createGira);
router.put('/:id', girasController.updateGira);
router.delete('/:id', girasController.deleteGira);
router.post('/:id/municipios', girasController.addMunicipioToGira);
router.delete('/:id_gira/municipios/:id_municipio', girasController.removeMunicipioFromGira);

module.exports = router;