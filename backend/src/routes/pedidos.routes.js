const express = require('express');
const { crearPedido, getPedidos, getPedidoById, registrarPago, marcarEntregado } = require('../controllers/pedidos.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.post('/', crearPedido);
router.get('/', getPedidos);
router.get('/:id', getPedidoById);
router.post('/:id_pedido/pagos', registrarPago);
router.put('/:id_pedido/entregar', marcarEntregado);

module.exports = router;