const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection } = require('./config/db');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const departamentosRoutes = require('./routes/departamentos.routes');
const municipiosRoutes = require('./routes/municipios.routes');
const bodegasRoutes = require('./routes/bodegas.routes');
const medicamentosRoutes = require('./routes/medicamentos.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const girasRoutes = require('./routes/giras.routes');
const clientesRoutes = require('./routes/clientes.routes');
const pedidosRoutes = require('./routes/pedidos.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/departamentos', departamentosRoutes);
app.use('/api/municipios', municipiosRoutes);
app.use('/api/bodegas', bodegasRoutes);
app.use('/api/medicamentos', medicamentosRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/giras', girasRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/pedidos', pedidosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Medical+ funcionando correctamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Iniciar servidor
async function startServer() {
  // Probar conexión a la base de datos
  const dbConnected = await testConnection();
  
  if (dbConnected) {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } else {
    console.error('No se pudo iniciar el servidor debido a problemas con la base de datos');
    process.exit(1);
  }
}

startServer();

module.exports = app; // Para pruebas