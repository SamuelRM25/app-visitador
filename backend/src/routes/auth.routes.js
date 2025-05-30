const express = require('express');
const { login, register, getProfile, changePassword } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const router = express.Router();

// Rutas públicas
router.post('/login', login);
router.post('/register', register);

// Rutas protegidas
router.get('/profile', verifyToken, getProfile);
router.post('/change-password', verifyToken, changePassword);

module.exports = router;