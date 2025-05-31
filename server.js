require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json()); // Para parsear el cuerpo de las peticiones JSON

// Configuración de la conexión a la base de datos
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

let pool; // Definir pool fuera de la función para reutilizarlo

async function connectDb() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('Conexión a la base de datos MySQL establecida correctamente.');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        process.exit(1); // Salir de la aplicación si no se puede conectar a la DB
    }
}

// Conectar a la base de datos al iniciar el servidor
connectDb();

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Visitador Médico funcionando!');
});

// Ruta de Login
app.post('/api/auth/login', async (req, res) => {
    const { correo_electronico, contrasena } = req.body;

    if (!correo_electronico || !contrasena) {
        return res.status(400).json({ message: 'Correo electrónico y contraseña son requeridos.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT id_usuario, correo_electronico, contrasena, id_perfil FROM Usuarios WHERE correo_electronico = ?',
            [correo_electronico]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const user = rows[0];

        // Comparar la contraseña encriptada
        const isMatch = await bcrypt.compare(contrasena, user.contrasena);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Generar un token JWT
        const token = jwt.sign(
            { id_usuario: user.id_usuario, id_perfil: user.id_perfil },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        res.status(200).json({
            message: 'Login exitoso',
            token,
            user: {
                id_usuario: user.id_usuario,
                correo_electronico: user.correo_electronico,
                id_perfil: user.id_perfil
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release(); // Liberar la conexión al pool
    }
});

// Middleware para proteger rutas (ejemplo)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // No autorizado
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Token inválido
        }
        req.user = user;
        next();
    });
};

// Ejemplo de ruta protegida
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Esta es una ruta protegida', user: req.user });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Node.js corriendo en el puerto ${PORT}`);
    console.log(`URL del servidor: http://localhost:${PORT}`);
});