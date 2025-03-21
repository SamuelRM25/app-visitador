-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS kaizen_medical;
USE kaizen_medical;

-- Tabla de usuarios (para el sistema de login)
CREATE TABLE IF NOT EXISTS usuarios (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    us_user VARCHAR(50) NOT NULL UNIQUE,
    pass_user VARCHAR(255) NOT NULL,
    nom_user VARCHAR(100) NOT NULL,
    email_user VARCHAR(100) NOT NULL,
    phone_user VARCHAR(20),
    role_user ENUM('admin', 'visitador', 'supervisor') NOT NULL DEFAULT 'visitador',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de giras (zonas geográficas)
CREATE TABLE IF NOT EXISTS giras (
    id_gira INT AUTO_INCREMENT PRIMARY KEY,
    codigo_gira VARCHAR(10) NOT NULL UNIQUE,
    nombre_gira VARCHAR(100) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de clientes (médicos, farmacias, etc.)
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    codigo_cliente VARCHAR(20) NOT NULL UNIQUE,
    nombre_cliente VARCHAR(100) NOT NULL,
    tipo_cliente ENUM('medico', 'farmacia', 'hospital', 'clinica', 'otro') NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    id_gira INT NOT NULL,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_gira) REFERENCES giras(id_gira) ON DELETE RESTRICT
);

-- Tabla de medicamentos
CREATE TABLE IF NOT EXISTS medicamentos (
    id_medicamento INT AUTO_INCREMENT PRIMARY KEY,
    codigo_medicamento VARCHAR(20) NOT NULL UNIQUE,
    nombre_medicamento VARCHAR(100) NOT NULL,
    presentacion VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_unitario DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de bodegas (inventario asignado al visitador)
CREATE TABLE IF NOT EXISTS bodegas (
    id_bodega INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    nombre_bodega VARCHAR(100) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES usuarios(id_user) ON DELETE RESTRICT
);

-- Tabla de inventario en bodega
CREATE TABLE IF NOT EXISTS inventario_bodega (
    id_inventario INT AUTO_INCREMENT PRIMARY KEY,
    id_bodega INT NOT NULL,
    id_medicamento INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 0,
    fecha_asignacion DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_bodega) REFERENCES bodegas(id_bodega) ON DELETE CASCADE,
    FOREIGN KEY (id_medicamento) REFERENCES medicamentos(id_medicamento) ON DELETE RESTRICT
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    codigo_pedido VARCHAR(20) NOT NULL UNIQUE,
    id_cliente INT NOT NULL,
    id_user INT NOT NULL,
    fecha_pedido DATE NOT NULL,
    estado ENUM('pendiente', 'entregado', 'cancelado') NOT NULL DEFAULT 'pendiente',
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE RESTRICT,
    FOREIGN KEY (id_user) REFERENCES usuarios(id_user) ON DELETE RESTRICT
);

-- Tabla de detalles de pedido
CREATE TABLE IF NOT EXISTS detalles_pedido (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_medicamento INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_medicamento) REFERENCES medicamentos(id_medicamento) ON DELETE RESTRICT
);

-- Tabla de cobros
CREATE TABLE IF NOT EXISTS cobros (
    id_cobro INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_cobro DATE NOT NULL,
    metodo_pago ENUM('efectivo', 'transferencia', 'cheque', 'otro') NOT NULL,
    referencia VARCHAR(50),
    estado ENUM('pendiente', 'completado', 'anulado') NOT NULL DEFAULT 'pendiente',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE RESTRICT
);

-- Tabla de visitas diarias
CREATE TABLE IF NOT EXISTS visitas (
    id_visita INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    id_cliente INT NOT NULL,
    fecha_visita DATE NOT NULL,
    hora_visita TIME NOT NULL,
    resultado ENUM('exitosa', 'no_encontrado', 'reprogramada', 'otro') NOT NULL,
    se_realizo_venta BOOLEAN NOT NULL DEFAULT FALSE,
    id_pedido INT,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES usuarios(id_user) ON DELETE RESTRICT,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE RESTRICT,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE SET NULL
);

-- Tabla de reportes diarios
CREATE TABLE IF NOT EXISTS reportes_diarios (
    id_reporte_diario INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    fecha_reporte DATE NOT NULL,
    total_visitas INT NOT NULL DEFAULT 0,
    total_ventas INT NOT NULL DEFAULT 0,
    monto_total_ventas DECIMAL(10,2) NOT NULL DEFAULT 0,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES usuarios(id_user) ON DELETE RESTRICT
);

-- Tabla de reportes semanales
CREATE TABLE IF NOT EXISTS reportes_semanales (
    id_reporte_semanal INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    semana INT NOT NULL,
    anio INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    total_visitas INT NOT NULL DEFAULT 0,
    total_ventas INT NOT NULL DEFAULT 0,
    monto_total_ventas DECIMAL(10,2) NOT NULL DEFAULT 0,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES usuarios(id_user) ON DELETE RESTRICT
);

-- Tabla de reportes mensuales
CREATE TABLE IF NOT EXISTS reportes_mensuales (
    id_reporte_mensual INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    mes INT NOT NULL,
    anio INT NOT NULL,
    total_visitas INT NOT NULL DEFAULT 0,
    total_ventas INT NOT NULL DEFAULT 0,
    monto_total_ventas DECIMAL(10,2) NOT NULL DEFAULT 0,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES usuarios(id_user) ON DELETE RESTRICT
);