// server.js
const express = require('express');
const cors = require('cors'); // Para permitir peticiones desde tu app Flutter
const app = express();
const PORT = process.env.PORT || 3000; // Puedes usar el puerto que desees

// Importar rutas
const medicamentoRoutes = require('./routes/medicamentoRoutes.js/index.js');
const inventarioRoutes = require('./routes/inventarioRoutes.js/index.js');
const pedidoRoutes = require('./routes/pedidoRoutes.js/index.js');
const giraRoutes = require('./routes/giraRoutes.js'); // Nueva ruta para giras

// Middlewares
app.use(cors()); // Habilita CORS para todas las solicitudes
app.use(express.json()); // Para parsear el cuerpo de las solicitudes JSON

// Rutas
app.use('/api', medicamentoRoutes);
app.use('/api', inventarioRoutes);
app.use('/api', pedidoRoutes);
app.use('/api', giraRoutes); // Usa las rutas de gira

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de KaizenAPP funcionando!');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});