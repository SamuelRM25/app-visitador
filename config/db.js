const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
  host: process.env.MYSQL_ADDON_HOST || 'bfpwrmhy4dzlk0mpxsrb-mysql.services.clever-cloud.com',
  user: process.env.MYSQL_ADDON_USER || 'udmfyptt5vjnpyao',
  password: process.env.MYSQL_ADDON_PASSWORD || 'zoN6Mu8xYDKblz35ZpGz',
  database: process.env.MYSQL_ADDON_DB || 'bfpwrmhy4dzlk0mpxsrb',
  port: process.env.MYSQL_ADDON_PORT || '3306',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión a la base de datos establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
