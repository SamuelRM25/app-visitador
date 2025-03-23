const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');

// Cargar variables de entorno
dotenv.config();

// Importar rutas
const authRoutes = require('./routes/auth');
const medicamentosRoutes = require('./routes/medicamentos');
const clientesRoutes = require('./routes/clientes');
const pedidosRoutes = require('./routes/pedidos');
const bodegasRoutes = require('./routes/bodegas');

// Crear aplicación Express
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/medicamentos', medicamentosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/bodegas', bodegasRoutes);

// Add a test endpoint to verify the server is running
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Kaizen funcionando correctamente',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Puerto - Render asigna PORT automáticamente
const PORT = process.env.PORT || 3000;

// Iniciar servidor después de comprobar la conexión a la base de datos
async function startServer() {
  try {
    // Comprobar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('No se pudo establecer conexión con la base de datos. El servidor no se iniciará.');
      process.exit(1);
    }
    
    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
      console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
      
      // Mostrar URL correcta para Render
      if (process.env.RENDER) {
        console.log(`API disponible en https://${process.env.RENDER_SERVICE_NAME}.onrender.com`);
      } else {
        console.log(`API disponible en http://localhost:${PORT}`);
      }
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Ejecutar la función para iniciar el servidor
startServer();
