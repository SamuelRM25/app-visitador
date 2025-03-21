USE kaizen_medical;

-- Insertar usuario administrador
INSERT INTO usuarios (us_user, pass_user, nom_user, email_user, phone_user, role_user)
VALUES ('admin', 'admin', 'Samuel Ramirez', 'samuel.ramirez25prs@gmail.com', '49617032', 'admin');

-- Insertar giras
INSERT INTO giras (codigo_gira, nombre_gira, descripcion) VALUES
('G001', 'Zona Norte', 'Departamentos del norte del país'),
('G002', 'Zona Sur', 'Departamentos del sur del país'),
('G003', 'Zona Este', 'Departamentos del este del país'),
('G004', 'Zona Oeste', 'Departamentos del oeste del país');

-- Insertar medicamentos
INSERT INTO medicamentos (codigo_medicamento, nombre_medicamento, presentacion, descripcion, precio_unitario) VALUES
('MED001', 'Aspek', 'Tabletas 500mg', 'Analgésico y antiinflamatorio', 150.00),
('MED002', 'Dastyl C', 'Jarabe 120ml', 'Jarabe para la tos', 180.00),
('MED003', 'Dastyl C', 'Tabletas 250mg', 'Tabletas para la tos', 200.00),
('MED004', 'Kaizezol', 'Cápsulas 20mg', 'Inhibidor de la bomba de protones', 250.00),
('MED005', 'Kaizezol', 'Inyectable 40mg', 'Inhibidor de la bomba de protones inyectable', 300.00),
('MED006', 'Metronis', 'Tabletas 500mg', 'Antibiótico', 220.00),
('MED007', 'Metronis', 'Suspensión 125mg/5ml', 'Antibiótico en suspensión', 180.00),
('MED008', 'Upukai', 'Tabletas 10mg', 'Antihistamínico', 160.00);

-- Crear bodega para el usuario admin
INSERT INTO bodegas (id_user, nombre_bodega, descripcion)
VALUES (1, 'Bodega Principal', 'Bodega asignada al visitador principal');

-- Asignar inventario inicial a la bodega
INSERT INTO inventario_bodega (id_bodega, id_medicamento, cantidad, fecha_asignacion) VALUES
(1, 1, 100, CURDATE()),
(1, 2, 50, CURDATE()),
(1, 3, 50, CURDATE()),
(1, 4, 80, CURDATE()),
(1, 5, 40, CURDATE()),
(1, 6, 60, CURDATE()),
(1, 7, 45, CURDATE()),
(1, 8, 70, CURDATE());

-- Insertar algunos clientes de ejemplo
INSERT INTO clientes (codigo_cliente, nombre_cliente, tipo_cliente, direccion, telefono, email, id_gira) VALUES
('C001-G001', 'Dr. Juan Pérez', 'medico', 'Clínica Central, Zona Norte', '12345678', 'juan.perez@email.com', 1),
('C002-G001', 'Farmacia San José', 'farmacia', 'Calle Principal, Zona Norte', '87654321', 'farmacia.sanjose@email.com', 1),
('C003-G002', 'Dra. María López', 'medico', 'Hospital Regional, Zona Sur', '23456789', 'maria.lopez@email.com', 2),
('C004-G003', 'Clínica Oriental', 'clinica', 'Avenida Este, Zona Este', '34567890', 'clinica.oriental@email.com', 3),
('C005-G004', 'Hospital Occidental', 'hospital', 'Boulevard Oeste, Zona Oeste', '45678901', 'hospital.occidental@email.com', 4);