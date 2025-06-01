// db.js
const mysql = require('mysql2/promise'); // Usaremos la versión de promesas

const pool = mysql.createPool({
    host: 'bfpwrmhy4dzlk0mpxsrb-mysql.services.clever-cloud.com', //
    user: 'YOUR_DB_USER',
    password: 'YOUR_DB_PASSWORD',
    database: 'bfpwrmhy4dzlk0mpxsrb', //
    port: 3306, //
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;