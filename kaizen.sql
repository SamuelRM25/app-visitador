-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS bfpwrmhy4dzlk0mpxsrb;
USE bfpwrmhy4dzlk0mpxsrb;

-- Tabla Usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre_usuario VARCHAR(100) NOT NULL,
    telefono_usuario VARCHAR(20) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla Departamento
CREATE TABLE IF NOT EXISTS Departamento (
    id_departamento INT AUTO_INCREMENT PRIMARY KEY,
    nombre_departamento VARCHAR(100) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla Municipio
CREATE TABLE IF NOT EXISTS Municipio (
    id_municipio INT AUTO_INCREMENT PRIMARY KEY,
    id_departamento INT NOT NULL,
    nombre_municipio VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_departamento) REFERENCES Departamento(id_departamento) ON DELETE RESTRICT,
    UNIQUE KEY unique_municipio_departamento (nombre_municipio, id_departamento)
);

-- Tabla Bodegas
CREATE TABLE IF NOT EXISTS Bodegas (
    id_bodega INT AUTO_INCREMENT PRIMARY KEY,
    usuario_bodega INT NOT NULL,
    nombre_bodega VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_bodega) REFERENCES Usuarios(id_usuario) ON DELETE RESTRICT
);

-- Tabla Medicamento
CREATE TABLE IF NOT EXISTS Medicamento (
    id_medicamento VARCHAR(20) PRIMARY KEY,
    nombre_medicamento VARCHAR(100) NOT NULL,
    molecula_medicamento VARCHAR(100) NOT NULL,
    presentacion_medicamento VARCHAR(100) NOT NULL,
    precio_medicamento DECIMAL(10,2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla Inventario por Bodega
CREATE TABLE IF NOT EXISTS Inventario_Bodega (
    id_inventario INT AUTO_INCREMENT PRIMARY KEY,
    id_bodega INT NOT NULL,
    id_usuario INT NOT NULL,
    id_medicamento VARCHAR(20) NOT NULL,
    cantidad_medicamento INT NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_bodega) REFERENCES Bodegas(id_bodega) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE RESTRICT,
    FOREIGN KEY (id_medicamento) REFERENCES Medicamento(id_medicamento) ON DELETE RESTRICT,
    UNIQUE KEY unique_medicamento_bodega (id_medicamento, id_bodega)
);

-- Tabla Giras
CREATE TABLE IF NOT EXISTS Giras (
    id_gira VARCHAR(20) PRIMARY KEY,
    id_departamento INT NOT NULL,
    nombre_gira VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_departamento) REFERENCES Departamento(id_departamento) ON DELETE RESTRICT
);

-- Tabla Gira Municipio
CREATE TABLE IF NOT EXISTS Gira_Municipio (
    id_gira_municipio VARCHAR(20) PRIMARY KEY,
    id_gira VARCHAR(20) NOT NULL,
    id_municipio INT NOT NULL,
    fecha_visita DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_gira) REFERENCES Giras(id_gira) ON DELETE CASCADE,
    FOREIGN KEY (id_municipio) REFERENCES Municipio(id_municipio) ON DELETE RESTRICT,
    UNIQUE KEY unique_gira_municipio (id_gira, id_municipio)
);

-- Tabla Clientes
CREATE TABLE IF NOT EXISTS Clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    id_gira VARCHAR(20) NOT NULL,
    id_gira_municipio VARCHAR(20) NOT NULL,
    nombre_cliente VARCHAR(100) NOT NULL,
    telefono_cliente VARCHAR(20) NOT NULL,
    cliente_compra BOOLEAN DEFAULT FALSE,
    latitud_cliente DECIMAL(10,8),
    longitud_cliente DECIMAL(11,8),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_gira) REFERENCES Giras(id_gira) ON DELETE RESTRICT,
    FOREIGN KEY (id_gira_municipio) REFERENCES Gira_Municipio(id_gira_municipio) ON DELETE RESTRICT
);

-- Tabla Pedidos
CREATE TABLE IF NOT EXISTS Pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pedido_entregado ENUM('si', 'no') DEFAULT 'no',
    total_pedido DECIMAL(10,2) DEFAULT 0.00,
    fecha_entrega TIMESTAMP NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE RESTRICT
);

-- Tabla Detalles Pedidos
CREATE TABLE IF NOT EXISTS Detalles_Pedidos (
    id_detalle_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_inventario INT NOT NULL,
    id_medicamento VARCHAR(20) NOT NULL,
    cantidad_medicamento INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal_medicamento DECIMAL(10,2) NOT NULL,
    estado_pedido ENUM('pagado', 'abonado', 'entregado') DEFAULT 'abonado',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_inventario) REFERENCES Inventario_Bodega(id_inventario) ON DELETE RESTRICT,
    FOREIGN KEY (id_medicamento) REFERENCES Medicamento(id_medicamento) ON DELETE RESTRICT
);

-- Tabla para registrar pagos
CREATE TABLE IF NOT EXISTS Pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia') DEFAULT 'efectivo',
    referencia VARCHAR(100),
    id_usuario INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE RESTRICT
);

-- Tabla para registrar movimientos de inventario
CREATE TABLE IF NOT EXISTS Movimientos_Inventario (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_inventario INT NOT NULL,
    tipo_movimiento ENUM('entrada', 'salida', 'ajuste') NOT NULL,
    cantidad INT NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    id_usuario INT NOT NULL,
    id_pedido INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_inventario) REFERENCES Inventario_Bodega(id_inventario) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE RESTRICT,
    FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido) ON DELETE SET NULL
);

-- Tabla para registrar historial de precios
CREATE TABLE IF NOT EXISTS Historial_Precios (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_medicamento VARCHAR(20) NOT NULL,
    precio_anterior DECIMAL(10,2) NOT NULL,
    precio_nuevo DECIMAL(10,2) NOT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_medicamento) REFERENCES Medicamento(id_medicamento) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE RESTRICT
);

-- ========== TRIGGERS ==========

-- Trigger para actualizar el total del pedido cuando se agrega un detalle
DELIMITER //
CREATE TRIGGER actualizar_total_pedido AFTER INSERT ON Detalles_Pedidos
FOR EACH ROW
BEGIN
    UPDATE Pedidos
    SET total_pedido = (SELECT SUM(subtotal_medicamento) FROM Detalles_Pedidos WHERE id_pedido = NEW.id_pedido)
    WHERE id_pedido = NEW.id_pedido;
END //
DELIMITER ;

-- Trigger para actualizar el total del pedido cuando se modifica un detalle
DELIMITER //
CREATE TRIGGER actualizar_total_pedido_update AFTER UPDATE ON Detalles_Pedidos
FOR EACH ROW
BEGIN
    UPDATE Pedidos
    SET total_pedido = (SELECT SUM(subtotal_medicamento) FROM Detalles_Pedidos WHERE id_pedido = NEW.id_pedido)
    WHERE id_pedido = NEW.id_pedido;
END //
DELIMITER ;

-- Trigger para actualizar el total del pedido cuando se elimina un detalle
DELIMITER //
CREATE TRIGGER actualizar_total_pedido_delete AFTER DELETE ON Detalles_Pedidos
FOR EACH ROW
BEGIN
    UPDATE Pedidos
    SET total_pedido = (SELECT COALESCE(SUM(subtotal_medicamento), 0) FROM Detalles_Pedidos WHERE id_pedido = OLD.id_pedido)
    WHERE id_pedido = OLD.id_pedido;
END //
DELIMITER ;

-- Trigger para registrar cambios de precio en medicamentos
DELIMITER //
CREATE TRIGGER registrar_cambio_precio BEFORE UPDATE ON Medicamento
FOR EACH ROW
BEGIN
    IF OLD.precio_medicamento != NEW.precio_medicamento THEN
        INSERT INTO Historial_Precios (id_medicamento, precio_anterior, precio_nuevo, id_usuario)
        VALUES (OLD.id_medicamento, OLD.precio_medicamento, NEW.precio_medicamento, 
                (SELECT id_usuario FROM Usuarios LIMIT 1)); -- Idealmente se obtendría del contexto de la sesión
    END IF;
END //
DELIMITER ;

-- Trigger para actualizar inventario cuando se crea un pedido
DELIMITER //
CREATE TRIGGER actualizar_inventario_pedido AFTER INSERT ON Detalles_Pedidos
FOR EACH ROW
BEGIN
    -- Reducir el inventario
    UPDATE Inventario_Bodega
    SET cantidad_medicamento = cantidad_medicamento - NEW.cantidad_medicamento
    WHERE id_inventario = NEW.id_inventario;
    
    -- Registrar el movimiento
    INSERT INTO Movimientos_Inventario (id_inventario, tipo_movimiento, cantidad, motivo, id_usuario, id_pedido)
    SELECT NEW.id_inventario, 'salida', NEW.cantidad_medicamento, CONCAT('Pedido #', NEW.id_pedido), 
           (SELECT id_usuario FROM Pedidos WHERE id_pedido = NEW.id_pedido), NEW.id_pedido;
END //
DELIMITER ;

-- Trigger para marcar un pedido como entregado cuando todos sus detalles están entregados
DELIMITER //
CREATE TRIGGER actualizar_estado_pedido AFTER UPDATE ON Detalles_Pedidos
FOR EACH ROW
BEGIN
    DECLARE total_detalles INT;
    DECLARE detalles_entregados INT;
    
    IF NEW.estado_pedido = 'entregado' AND OLD.estado_pedido != 'entregado' THEN
        -- Contar total de detalles y detalles entregados
        SELECT COUNT(*), SUM(IF(estado_pedido = 'entregado', 1, 0))
        INTO total_detalles, detalles_entregados
        FROM Detalles_Pedidos
        WHERE id_pedido = NEW.id_pedido;
        
        -- Si todos los detalles están entregados, marcar el pedido como entregado
        IF total_detalles = detalles_entregados THEN
            UPDATE Pedidos
            SET pedido_entregado = 'si', fecha_entrega = CURRENT_TIMESTAMP
            WHERE id_pedido = NEW.id_pedido;
        END IF;
    END IF;
END //
DELIMITER ;

-- Trigger para actualizar el estado de cliente_compra cuando realiza un pedido
DELIMITER //
CREATE TRIGGER actualizar_cliente_compra AFTER INSERT ON Pedidos
FOR EACH ROW
BEGIN
    UPDATE Clientes
    SET cliente_compra = TRUE
    WHERE id_cliente = NEW.id_cliente;
END //
DELIMITER ;

-- Trigger para validar que no se pueda tener inventario negativo
DELIMITER //
CREATE TRIGGER validar_inventario_suficiente BEFORE UPDATE ON Inventario_Bodega
FOR EACH ROW
BEGIN
    IF NEW.cantidad_medicamento < 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'No hay suficiente inventario disponible';
    END IF;
END //
DELIMITER ;

-- Índices para mejorar el rendimiento
CREATE INDEX idx_usuario_bodega ON Bodegas(usuario_bodega);
CREATE INDEX idx_medicamento_precio ON Medicamento(precio_medicamento);
CREATE INDEX idx_inventario_medicamento ON Inventario_Bodega(id_medicamento);
CREATE INDEX idx_inventario_bodega ON Inventario_Bodega(id_bodega);
CREATE INDEX idx_gira_departamento ON Giras(id_departamento);
CREATE INDEX idx_gira_municipio_gira ON Gira_Municipio(id_gira);
CREATE INDEX idx_gira_municipio_municipio ON Gira_Municipio(id_municipio);
CREATE INDEX idx_cliente_gira ON Clientes(id_gira);
CREATE INDEX idx_cliente_gira_municipio ON Clientes(id_gira_municipio);
CREATE INDEX idx_pedido_cliente ON Pedidos(id_cliente);
CREATE INDEX idx_pedido_entregado ON Pedidos(pedido_entregado);
CREATE INDEX idx_detalle_pedido ON Detalles_Pedidos(id_pedido);
CREATE INDEX idx_detalle_medicamento ON Detalles_Pedidos(id_medicamento);
CREATE INDEX idx_detalle_estado ON Detalles_Pedidos(estado_pedido);
CREATE INDEX idx_pago_pedido ON Pagos(id_pedido);
CREATE INDEX idx_movimiento_inventario ON Movimientos_Inventario(id_inventario);
CREATE INDEX idx_movimiento_tipo ON Movimientos_Inventario(tipo_movimiento);

-- Procedimiento almacenado para crear un nuevo pedido completo
DELIMITER //
CREATE PROCEDURE crear_pedido(
    IN p_id_cliente INT,
    IN p_id_usuario INT
)
BEGIN
    DECLARE nuevo_id_pedido INT;
    
    START TRANSACTION;
    
    -- Crear el pedido
    INSERT INTO Pedidos (id_cliente, id_usuario)
    VALUES (p_id_cliente, p_id_usuario);
    
    -- Obtener el ID del pedido creado
    SET nuevo_id_pedido = LAST_INSERT_ID();
    
    -- Devolver el ID del pedido
    SELECT nuevo_id_pedido AS id_pedido;
    
    COMMIT;
END //
DELIMITER ;

-- Procedimiento almacenado para agregar un detalle a un pedido
DELIMITER //
CREATE PROCEDURE agregar_detalle_pedido(
    IN p_id_pedido INT,
    IN p_id_inventario INT,
    IN p_id_medicamento VARCHAR(20),
    IN p_cantidad INT
)
BEGIN
    DECLARE v_precio_unitario DECIMAL(10,2);
    DECLARE v_subtotal DECIMAL(10,2);
    DECLARE v_cantidad_disponible INT;
    
    -- Verificar inventario disponible
    SELECT cantidad_medicamento INTO v_cantidad_disponible
    FROM Inventario_Bodega
    WHERE id_inventario = p_id_inventario;
    
    IF v_cantidad_disponible < p_cantidad THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'No hay suficiente inventario disponible';
    ELSE
        -- Obtener precio del medicamento
        SELECT precio_medicamento INTO v_precio_unitario
        FROM Medicamento
        WHERE id_medicamento = p_id_medicamento;
        
        -- Calcular subtotal
        SET v_subtotal = v_precio_unitario * p_cantidad;
        
        -- Insertar detalle
        INSERT INTO Detalles_Pedidos (id_pedido, id_inventario, id_medicamento, cantidad_medicamento, precio_unitario, subtotal_medicamento)
        VALUES (p_id_pedido, p_id_inventario, p_id_medicamento, p_cantidad, v_precio_unitario, v_subtotal);
        
        -- El trigger actualizar_inventario_pedido se encargará de actualizar el inventario
    END IF;
END //
DELIMITER ;

-- Procedimiento almacenado para registrar un pago
DELIMITER //
CREATE PROCEDURE registrar_pago(
    IN p_id_pedido INT,
    IN p_monto DECIMAL(10,2),
    IN p_metodo_pago VARCHAR(20),
    IN p_referencia VARCHAR(100),
    IN p_id_usuario INT
)
BEGIN
    DECLARE v_total_pedido DECIMAL(10,2);
    DECLARE v_total_pagado DECIMAL(10,2);
    
    -- Obtener total del pedido
    SELECT total_pedido INTO v_total_pedido
    FROM Pedidos
    WHERE id_pedido = p_id_pedido;
    
    -- Obtener total pagado hasta ahora
    SELECT COALESCE(SUM(monto), 0) INTO v_total_pagado
    FROM Pagos
    WHERE id_pedido = p_id_pedido;
    
    -- Verificar que no se pague más de lo debido
    IF (v_total_pagado + p_monto) > v_total_pedido THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'El monto del pago excede el saldo pendiente';
    ELSE
        -- Registrar el pago
        INSERT INTO Pagos (id_pedido, monto, metodo_pago, referencia, id_usuario)
        VALUES (p_id_pedido, p_monto, p_metodo_pago, p_referencia, p_id_usuario);
        
        -- Actualizar estado de los detalles si el pedido está completamente pagado
        IF (v_total_pagado + p_monto) = v_total_pedido THEN
            UPDATE Detalles_Pedidos
            SET estado_pedido = 'pagado'
            WHERE id_pedido = p_id_pedido AND estado_pedido = 'abonado';
        END IF;
    END IF;
END //
DELIMITER ;

-- Vista para ver el inventario disponible
CREATE VIEW vista_inventario_disponible AS
SELECT 
    ib.id_inventario,
    b.id_bodega,
    b.nombre_bodega,
    m.id_medicamento,
    m.nombre_medicamento,
    m.molecula_medicamento,
    m.presentacion_medicamento,
    ib.cantidad_medicamento,
    m.precio_medicamento
FROM 
    Inventario_Bodega ib
    JOIN Bodegas b ON ib.id_bodega = b.id_bodega
    JOIN Medicamento m ON ib.id_medicamento = m.id_medicamento
WHERE 
    ib.cantidad_medicamento > 0
    AND b.activo = TRUE
    AND m.activo = TRUE;

-- Vista para ver el estado de los pedidos
CREATE VIEW vista_estado_pedidos AS
SELECT 
    p.id_pedido,
    c.nombre_cliente,
    c.telefono_cliente,
    p.fecha_pedido,
    p.pedido_entregado,
    p.total_pedido,
    COALESCE(SUM(pa.monto), 0) AS total_pagado,
    p.total_pedido - COALESCE(SUM(pa.monto), 0) AS saldo_pendiente,
    u.nombre_usuario AS vendedor
FROM 
    Pedidos p
    JOIN Clientes c ON p.id_cliente = c.id_cliente
    JOIN Usuarios u ON p.id_usuario = u.id_usuario
    LEFT JOIN Pagos pa ON p.id_pedido = pa.id_pedido
GROUP BY 
    p.id_pedido, c.nombre_cliente, c.telefono_cliente, p.fecha_pedido, 
    p.pedido_entregado, p.total_pedido, u.nombre_usuario;

-- Vista para ver detalles de pedidos
CREATE VIEW vista_detalles_pedidos AS
SELECT 
    dp.id_detalle_pedido,
    p.id_pedido,
    c.nombre_cliente,
    m.nombre_medicamento,
    m.presentacion_medicamento,
    dp.cantidad_medicamento,
    dp.precio_unitario,
    dp.subtotal_medicamento,
    dp.estado_pedido,
    p.fecha_pedido,
    p.pedido_entregado
FROM 
    Detalles_Pedidos dp
    JOIN Pedidos p ON dp.id_pedido = p.id_pedido
    JOIN Clientes c ON p.id_cliente = c.id_cliente
    JOIN Medicamento m ON dp.id_medicamento = m.id_medicamento;

-- Vista para ver clientes por gira
CREATE VIEW vista_clientes_gira AS
SELECT 
    g.id_gira,
    g.nombre_gira,
    d.nombre_departamento,
    m.nombre_municipio,
    gm.id_gira_municipio,
    c.id_cliente,
    c.nombre_cliente,
    c.telefono_cliente,
    c.cliente_compra,
    c.latitud_cliente,
    c.longitud_cliente
FROM 
    Clientes c
    JOIN Giras g ON c.id_gira = g.id_gira
    JOIN Gira_Municipio gm ON c.id_gira_municipio = gm.id_gira_municipio
    JOIN Municipio m ON gm.id_municipio = m.id_municipio
    JOIN Departamento d ON m.id_departamento = d.id_departamento
WHERE 
    c.activo = TRUE;