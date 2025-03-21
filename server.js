const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');

// Cargar variables de entorno
dotenv.config();

// Importar rutas
const authRoutes = require('./routes/auth');

// Crear aplicación Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Kaizen funcionando correctamente' });
});

// Puerto
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
      console.log(`API disponible en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Ejecutar la función para iniciar el servidor
startServer();