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

// Middleware para proteger rutas
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.warn('Acceso denegado: No se proporcionó token.');
        return res.sendStatus(401); // No autorizado
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.warn('Acceso denegado: Token inválido o expirado.', err.message);
            return res.sendStatus(403); // Token inválido
        }
        req.user = user;
        next();
    });
};

// --- RUTAS DE AUTENTICACIÓN ---

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Visitador Médico funcionando!');
});

// Ruta de Login
app.post('/api/auth/login', async (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT id_usuario, usuario, password, nombre_usuario, activo FROM Usuarios WHERE usuario = ? AND activo = 1',
            [usuario]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas o usuario inactivo.' });
        }

        const user = rows[0];

        // Comparar la contraseña encriptada
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Generar un token JWT
        const token = jwt.sign(
            { id_usuario: user.id_usuario, usuario: user.usuario, nombre_usuario: user.nombre_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        res.status(200).json({
            message: 'Login exitoso',
            token,
            user: {
                id_usuario: user.id_usuario,
                usuario: user.usuario,
                nombre_usuario: user.nombre_usuario,
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release(); // Liberar la conexión al pool
    }
});

// Ejemplo de ruta protegida (mantener para pruebas)
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Esta es una ruta protegida', user: req.user });
});

// --- RUTAS DEL MÓDULO DE GIRAS ---

// 1. Obtener todas las Giras (activas)
app.get('/api/giras', authenticateToken, async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [giras] = await connection.execute(
            'SELECT g.id_gira, g.nombre_gira, d.nombre_departamento ' +
            'FROM Giras g ' +
            'JOIN Departamento d ON g.id_departamento = d.id_departamento ' +
            'WHERE g.activo = 1 ORDER BY g.nombre_gira'
        );
        res.status(200).json(giras);
    } catch (error) {
        console.error('Error al obtener giras:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener giras.' });
    } finally {
        if (connection) connection.release();
    }
});

// 2. Obtener los municipios de una Gira específica
app.get('/api/giras/:idGira/municipios', authenticateToken, async (req, res) => {
    const { idGira } = req.params;
    let connection;
    try {
        connection = await pool.getConnection();
        const [municipios] = await connection.execute(
            'SELECT gm.id_gira_municipio, gm.id_gira, gm.fecha_visita, m.id_municipio, m.nombre_municipio, d.nombre_departamento ' +
            'FROM Gira_Municipio gm ' +
            'JOIN Municipio m ON gm.id_municipio = m.id_municipio ' +
            'JOIN Departamento d ON m.id_departamento = d.id_departamento ' +
            'WHERE gm.id_gira = ? ORDER BY gm.fecha_visita, m.nombre_municipio',
            [idGira]
        );
        if (municipios.length === 0) {
            return res.status(404).json({ message: 'No se encontraron municipios para esta gira o la gira no existe.' });
        }
        res.status(200).json(municipios);
    } catch (error) {
        console.error(`Error al obtener municipios para la gira ${idGira}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al obtener municipios de la gira.' });
    } finally {
        if (connection) connection.release();
    }
});

// 3. Obtener los clientes para una Gira y un Gira_Municipio específico
app.get('/api/giras/:idGira/gira-municipios/:idGiraMunicipio/clientes', authenticateToken, async (req, res) => {
    const { idGira, idGiraMunicipio } = req.params;
    let connection;
    try {
        connection = await pool.getConnection();
        const [clientes] = await connection.execute(
            'SELECT id_cliente, id_gira, id_gira_municipio, nombre_cliente, telefono_cliente, ' +
            'cliente_compra, latitud_cliente, longitud_cliente ' +
            'FROM Clientes ' +
            'WHERE id_gira = ? AND id_gira_municipio = ? AND activo = 1 ORDER BY nombre_cliente',
            [idGira, idGiraMunicipio]
        );
        if (clientes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron clientes para esta combinación de gira y municipio asignado.' });
        }
        res.status(200).json(clientes);
    } catch (error) {
        console.error(`Error al obtener clientes para la gira ${idGira} y gira_municipio ${idGiraMunicipio}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al obtener clientes.' });
    } finally {
        if (connection) connection.release();
    }
});

// --- NUEVAS RUTAS PARA PEDIDOS Y MEDICAMENTOS ---

// 4. Obtener el último pedido pendiente de un cliente
app.get('/api/clientes/:idCliente/pedidos/pendientes', authenticateToken, async (req, res) => {
    const { idCliente } = req.params;
    let connection;
    try {
        connection = await pool.getConnection();
        // Buscar el último pedido 'no entregado' para este cliente
        const [pedidos] = await connection.execute(
            'SELECT id_pedido, id_cliente, id_usuario, fecha_pedido, pedido_entregado, total_pedido, fecha_entrega ' +
            'FROM Pedidos ' +
            'WHERE id_cliente = ? AND pedido_entregado = "no" ' +
            'ORDER BY fecha_pedido DESC LIMIT 1',
            [idCliente]
        );

        if (pedidos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron pedidos pendientes para este cliente.' });
        }

        const pedido = pedidos[0];

        // Obtener los detalles de ese pedido
        const [detalles] = await connection.execute(
            'SELECT dp.id_detalle_pedido, dp.id_medicamento, dp.cantidad_medicamento, dp.precio_unitario, dp.subtotal_medicamento, dp.estado_pedido, ' +
            'm.nombre_medicamento, m.presentacion_medicamento ' +
            'FROM Detalles_Pedidos dp ' +
            'JOIN Medicamento m ON dp.id_medicamento = m.id_medicamento ' +
            'WHERE dp.id_pedido = ?',
            [pedido.id_pedido]
        );

        res.status(200).json({
            ...pedido,
            detalles_pedido: detalles
        });

    } catch (error) {
        console.error(`Error al obtener pedido pendiente para cliente ${idCliente}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al obtener pedido pendiente.' });
    } finally {
        if (connection) connection.release();
    }
});

// 5. Obtener todos los medicamentos disponibles con su cantidad en inventario
app.get('/api/medicamentos/disponibles', authenticateToken, async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [medicamentos] = await connection.execute(
            'SELECT m.id_medicamento, m.nombre_medicamento, m.molecula_medicamento, m.presentacion_medicamento, m.precio_medicamento, ' +
            'SUM(ib.cantidad_medicamento) AS cantidad_disponible ' + // Suma de inventario de todas las bodegas
            'FROM Medicamento m ' +
            'JOIN Inventario_Bodega ib ON m.id_medicamento = ib.id_medicamento ' +
            'WHERE m.activo = 1 ' +
            'GROUP BY m.id_medicamento, m.nombre_medicamento, m.molecula_medicamento, m.presentacion_medicamento, m.precio_medicamento ' +
            'HAVING SUM(ib.cantidad_medicamento) > 0 ' + // Solo medicamentos con stock > 0
            'ORDER BY m.nombre_medicamento'
        );
        res.status(200).json(medicamentos);
    } catch (error) {
        console.error('Error al obtener medicamentos disponibles:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener medicamentos.' });
    } finally {
        if (connection) connection.release();
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Node.js corriendo en el puerto ${PORT}`);
    console.log(`URL del servidor: http://localhost:${PORT}`);
});