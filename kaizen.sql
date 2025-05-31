-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: bfpwrmhy4dzlk0mpxsrb-mysql.services.clever-cloud.com:3306
-- Tiempo de generación: 31-05-2025 a las 18:47:41
-- Versión del servidor: 8.0.22-13
-- Versión de PHP: 8.2.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bfpwrmhy4dzlk0mpxsrb`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Bodegas`
--

CREATE TABLE `Bodegas` (
  `id_bodega` int NOT NULL,
  `usuario_bodega` int NOT NULL,
  `nombre_bodega` varchar(100) NOT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `activo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `Bodegas`
--

INSERT INTO `Bodegas` (`id_bodega`, `usuario_bodega`, `nombre_bodega`, `ubicacion`, `fecha_creacion`, `fecha_modificacion`, `activo`) VALUES
(1, 1, 'Huehuetenango', 'Huehuetenango', '2025-05-30 01:34:26', '2025-05-30 01:34:26', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Clientes`
--

CREATE TABLE `Clientes` (
  `id_cliente` int NOT NULL,
  `id_gira` varchar(20) NOT NULL,
  `id_gira_municipio` varchar(20) NOT NULL,
  `nombre_cliente` varchar(100) NOT NULL,
  `telefono_cliente` varchar(20) NOT NULL,
  `cliente_compra` tinyint(1) DEFAULT '0',
  `latitud_cliente` decimal(10,8) DEFAULT NULL,
  `longitud_cliente` decimal(11,8) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `activo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Departamento`
--

CREATE TABLE `Departamento` (
  `id_departamento` int NOT NULL,
  `nombre_departamento` varchar(100) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `Departamento`
--

INSERT INTO `Departamento` (`id_departamento`, `nombre_departamento`, `fecha_creacion`, `fecha_modificacion`) VALUES
(1, 'Guatemala', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(2, 'El Progreso', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(3, 'Sacatepéquez', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(4, 'Chimaltenango', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(5, 'Escuintla', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(6, 'Santa Rosa', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(7, 'Sololá', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(8, 'Totonicapán', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(9, 'Quetzaltenango', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(10, 'Suchitepéquez', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(11, 'Retalhuleu', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(12, 'San Marcos', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(13, 'Huehuetenango', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(14, 'Quiché', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(15, 'Baja Verapaz', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(16, 'Alta Verapaz', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(17, 'Petén', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(18, 'Izabal', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(19, 'Zacapa', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(20, 'Chiquimula', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(21, 'Jalapa', '2025-05-30 01:37:37', '2025-05-30 01:37:37'),
(22, 'Jutiapa', '2025-05-30 01:37:37', '2025-05-30 01:37:37');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Detalles_Pedidos`
--

CREATE TABLE `Detalles_Pedidos` (
  `id_detalle_pedido` int NOT NULL,
  `id_pedido` int NOT NULL,
  `id_inventario` int NOT NULL,
  `id_medicamento` varchar(20) NOT NULL,
  `cantidad_medicamento` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal_medicamento` decimal(10,2) NOT NULL,
  `estado_pedido` enum('pagado','abonado','entregado') DEFAULT 'abonado',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Giras`
--

CREATE TABLE `Giras` (
  `id_gira` varchar(20) NOT NULL,
  `id_departamento` int NOT NULL,
  `nombre_gira` varchar(100) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `activo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `Giras`
--

INSERT INTO `Giras` (`id_gira`, `id_departamento`, `nombre_gira`, `fecha_creacion`, `fecha_modificacion`, `activo`) VALUES
('AX', 9, 'Aledaños de Xela', '2025-05-30 02:00:24', '2025-05-30 02:02:07', 1),
('HUE', 13, 'Cabecera', '2025-05-30 02:00:24', '2025-05-30 02:01:42', 1),
('LM', 13, 'La Mesilla', '2025-05-30 02:00:24', '2025-05-30 02:01:46', 1),
('SCB', 13, 'Santa Cruz Barillas', '2025-05-30 02:00:24', '2025-05-30 02:01:50', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Gira_Municipio`
--

CREATE TABLE `Gira_Municipio` (
  `id_gira_municipio` varchar(20) NOT NULL,
  `id_gira` varchar(20) NOT NULL,
  `id_municipio` int NOT NULL,
  `fecha_visita` date DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `Gira_Municipio`
--

INSERT INTO `Gira_Municipio` (`id_gira_municipio`, `id_gira`, `id_municipio`, `fecha_visita`, `fecha_creacion`, `fecha_modificacion`) VALUES
('AG', 'SCB', 223, NULL, '2025-05-30 02:21:26', '2025-05-30 02:21:26'),
('CBR', 'AX', 118, NULL, '2025-05-30 02:40:41', '2025-05-30 02:40:41'),
('CC', 'AX', 200, NULL, '2025-05-30 02:40:41', '2025-05-30 02:40:41'),
('CCH', 'LM', 218, NULL, '2025-05-30 02:33:22', '2025-05-30 02:33:22'),
('CH', 'SCB', 198, NULL, '2025-05-30 02:21:26', '2025-05-30 02:21:26'),
('COL', 'AX', 215, NULL, '2025-05-30 02:40:41', '2025-05-30 02:40:41'),
('HC', 'HUE', 197, NULL, '2025-05-30 02:18:14', '2025-05-30 02:18:14'),
('JCL', 'LM', 203, NULL, '2025-05-30 02:33:22', '2025-05-30 02:33:22'),
('LD', 'LM', 208, NULL, '2025-05-30 02:33:22', '2025-05-30 02:33:22'),
('LL', 'LM', 207, NULL, '2025-05-30 02:33:22', '2025-05-30 02:33:22'),
('LM', 'LM', 341, NULL, '2025-05-30 02:33:22', '2025-05-30 02:33:22'),
('MAL', 'AX', 199, NULL, '2025-05-30 02:40:41', '2025-05-30 02:40:41'),
('MM', 'AX', 109, NULL, '2025-05-30 02:40:41', '2025-05-30 02:40:41'),
('NN', 'LM', 201, NULL, '2025-05-30 02:33:22', '2025-05-30 02:33:22'),
('POL', 'AX', 342, NULL, '2025-05-30 02:43:27', '2025-05-30 02:43:27'),
('RT', 'AX', 343, NULL, '2025-05-30 02:43:27', '2025-05-30 02:43:27'),
('SAAH', 'LM', 227, NULL, '2025-05-30 02:33:22', '2025-05-30 02:33:22'),
('SAH', 'LM', 220, NULL, '2025-05-30 02:33:22', '2025-05-30 02:33:22'),
('SCB', 'SCB', 222, NULL, '2025-05-30 02:21:26', '2025-05-30 02:21:26'),
('SCJ', 'AX', 116, NULL, '2025-05-30 02:40:41', '2025-05-30 02:40:41'),
('SCT', 'AX', 106, NULL, '2025-05-30 02:40:41', '2025-05-30 02:40:41'),
('SE', 'SCB', 213, NULL, '2025-05-30 02:21:26', '2025-05-30 02:21:26'),
('SFA', 'AX', 107, NULL, '2025-05-30 02:43:27', '2025-05-30 02:43:27'),
('SII', 'AX', 205, NULL, '2025-05-30 02:40:41', '2025-05-30 02:40:41'),
('SJA', 'AX', 212, NULL, '2025-05-30 02:40:41', '2025-05-30 02:40:41'),
('SJI', 'SCB', 219, NULL, '2025-05-30 02:21:26', '2025-05-30 02:21:26'),
('SJO', 'AX', 121, NULL, '2025-05-30 02:40:41', '2025-05-30 02:40:41'),
('SPN', 'LM', 202, NULL, '2025-05-30 02:33:22', '2025-05-30 02:33:22'),
('SPS', 'SCB', 204, NULL, '2025-05-30 02:21:26', '2025-05-30 02:21:26'),
('SSB', 'AX', 216, NULL, '2025-05-30 02:40:41', '2025-05-30 02:40:41'),
('TS', 'SCB', 211, NULL, '2025-05-30 02:21:26', '2025-05-30 02:21:26'),
('TT', 'AX', 105, NULL, '2025-05-30 02:40:41', '2025-05-30 02:40:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Historial_Precios`
--

CREATE TABLE `Historial_Precios` (
  `id_historial` int NOT NULL,
  `id_medicamento` varchar(20) NOT NULL,
  `precio_anterior` decimal(10,2) NOT NULL,
  `precio_nuevo` decimal(10,2) NOT NULL,
  `fecha_cambio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Inventario_Bodega`
--

CREATE TABLE `Inventario_Bodega` (
  `id_inventario` int NOT NULL,
  `id_bodega` int NOT NULL,
  `id_usuario` int NOT NULL,
  `id_medicamento` varchar(20) NOT NULL,
  `cantidad_medicamento` int NOT NULL DEFAULT '0',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `Inventario_Bodega`
--

INSERT INTO `Inventario_Bodega` (`id_inventario`, `id_bodega`, `id_usuario`, `id_medicamento`, `cantidad_medicamento`, `fecha_creacion`, `fecha_modificacion`) VALUES
(1, 1, 1, 'ASK', 50, '2025-05-30 01:57:42', '2025-05-30 01:57:42'),
(2, 1, 1, 'DC10', 50, '2025-05-30 01:57:42', '2025-05-30 01:57:42'),
(3, 1, 1, 'DC100', 6, '2025-05-30 01:57:42', '2025-05-30 01:57:42'),
(4, 1, 1, 'K30', 50, '2025-05-30 01:57:42', '2025-05-30 01:57:42'),
(5, 1, 1, 'K100', 6, '2025-05-30 01:57:42', '2025-05-30 01:57:42'),
(6, 1, 1, 'M30', 25, '2025-05-30 01:57:42', '2025-05-30 01:57:42'),
(7, 1, 1, 'M60', 25, '2025-05-30 01:57:42', '2025-05-30 01:57:42'),
(8, 1, 1, 'UK', 50, '2025-05-30 01:57:42', '2025-05-30 01:57:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Medicamento`
--

CREATE TABLE `Medicamento` (
  `id_medicamento` varchar(20) NOT NULL,
  `nombre_medicamento` varchar(100) NOT NULL,
  `molecula_medicamento` varchar(100) NOT NULL,
  `presentacion_medicamento` varchar(100) NOT NULL,
  `precio_medicamento` decimal(10,2) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `activo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `Medicamento`
--

INSERT INTO `Medicamento` (`id_medicamento`, `nombre_medicamento`, `molecula_medicamento`, `presentacion_medicamento`, `precio_medicamento`, `fecha_creacion`, `fecha_modificacion`, `activo`) VALUES
('ASK', 'Aspek', 'Aspartato de Arginina', 'Caja de 15 Flaconetes de 15mL/5gr', 149.25, '2025-05-30 01:53:30', '2025-05-30 01:54:57', 1),
('DC10', 'Dastyl C', 'Celecoxib 200mg', 'Caja de 10 cápsulas', 54.20, '2025-05-30 01:53:30', '2025-05-30 01:55:16', 1),
('DC100', 'Dastyl C', 'Celecoxib 200mg', 'Caja de 100 cápsulas', 436.25, '2025-05-30 01:53:30', '2025-05-30 01:55:20', 1),
('K100', 'Kaizezol', 'Pantoprazol 40mg', 'Caja de 100 cápsulas con gránulos entéricos', 391.15, '2025-05-30 01:53:30', '2025-05-30 01:55:11', 1),
('K30', 'Kaizezol', 'Pantoprazol 40mg', 'Caja de 30 cápsulas con gránulos entéricos', 129.30, '2025-05-30 01:53:30', '2025-05-30 01:55:07', 1),
('M30', 'Metronis', 'Nitazoxanida 100mg/5mL', 'Polvo en suspensión de 30mL', 41.20, '2025-05-30 01:53:30', '2025-05-30 01:55:25', 1),
('M60', 'Metronis', 'Nitazoxanida 100mg/5mL', 'Polvo en suspensión de 60mL', 51.50, '2025-05-30 01:53:30', '2025-05-30 01:55:28', 1),
('UK', 'Upu Kai', 'Ambroxol + Clembuterol', 'Jarabe de 120mL', 47.45, '2025-05-30 01:53:30', '2025-05-30 01:55:02', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Movimientos_Inventario`
--

CREATE TABLE `Movimientos_Inventario` (
  `id_movimiento` int NOT NULL,
  `id_inventario` int NOT NULL,
  `tipo_movimiento` enum('entrada','salida','ajuste') NOT NULL,
  `cantidad` int NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `id_usuario` int NOT NULL,
  `id_pedido` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Municipio`
--

CREATE TABLE `Municipio` (
  `id_municipio` int NOT NULL,
  `id_departamento` int NOT NULL,
  `nombre_municipio` varchar(100) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `Municipio`
--

INSERT INTO `Municipio` (`id_municipio`, `id_departamento`, `nombre_municipio`, `fecha_creacion`, `fecha_modificacion`) VALUES
(1, 1, 'Guatemala', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(2, 1, 'Santa Catarina Pinula', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(3, 1, 'San José Pinula', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(4, 1, 'San José del Golfo', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(5, 1, 'Palencia', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(6, 1, 'Chinautla', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(7, 1, 'San Pedro Ayampuc', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(8, 1, 'Mixco', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(9, 1, 'San Pedro Sacatepéquez', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(10, 1, 'San Juan Sacatepéquez', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(11, 1, 'San Raymundo', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(12, 1, 'Chuarrancho', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(13, 1, 'Fraijanes', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(14, 1, 'Amatitlán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(15, 1, 'Villa Nueva', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(16, 1, 'Villa Canales', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(17, 1, 'Petapa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(18, 2, 'Guastatoya', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(19, 2, 'Morazán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(20, 2, 'San Agustín Acasaguastlán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(21, 2, 'San Cristóbal Acasaguastlán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(22, 2, 'El Jícaro', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(23, 2, 'Sansare', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(24, 2, 'Sanarate', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(25, 2, 'San Antonio La Paz', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(26, 3, 'Antigua Guatemala', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(27, 3, 'Ciudad Vieja', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(28, 3, 'Jocotenango', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(29, 3, 'Pastores', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(30, 3, 'Sumpango', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(31, 3, 'Santo Domingo Xenacoj', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(32, 3, 'Santiago Sacatepéquez', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(33, 3, 'San Bartolomé Milpas Altas', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(34, 3, 'San Lucas Sacatepéquez', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(35, 3, 'Santa Lucía Milpas Altas', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(36, 3, 'Magdalena Milpas Altas', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(37, 3, 'Santa María de Jesús', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(38, 3, 'Alotenango', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(39, 3, 'San Miguel Dueñas', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(40, 3, 'Santa Catarina Barahona', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(41, 3, 'San Antonio Aguas Calientes', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(42, 4, 'Chimaltenango', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(43, 4, 'San José Poaquil', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(44, 4, 'San Martín Jilotepeque', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(45, 4, 'San Juan Comalapa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(46, 4, 'Santa Apolonia', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(47, 4, 'Tecpán Guatemala', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(48, 4, 'Patzún', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(49, 4, 'Pochuta', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(50, 4, 'Patzicía', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(51, 4, 'Santa Cruz Balanyá', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(52, 4, 'Acatenango', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(53, 4, 'Yepocapa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(54, 4, 'San Andrés Itzapa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(55, 4, 'Parramos', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(56, 4, 'Zaragoza', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(57, 4, 'El Tejar', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(58, 5, 'Escuintla', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(59, 5, 'Santa Lucía Cotzumalguapa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(60, 5, 'La Democracia', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(61, 5, 'Siquinalá', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(62, 5, 'Masagua', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(63, 5, 'Tiquisate', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(64, 5, 'La Gomera', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(65, 5, 'Guanagazapa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(66, 5, 'Puerto de San José', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(67, 5, 'Iztapa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(68, 5, 'Palín', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(69, 5, 'San Vicente Pacaya', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(70, 5, 'Nueva Concepción', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(71, 5, 'Sipacate', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(72, 6, 'Cuilapa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(73, 6, 'Barberena', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(74, 6, 'Santa Rosa de Lima', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(75, 6, 'Casillas', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(76, 6, 'San Rafael Las Flores', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(77, 6, 'Oratorio', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(78, 6, 'San Juan Tecuaco', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(79, 6, 'Chiquimulilla', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(80, 6, 'Taxisco', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(81, 6, 'Santa María Ixhuatán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(82, 6, 'Guazacapán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(83, 6, 'Santa Cruz Naranjo', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(84, 6, 'Pueblo Nuevo Viñas', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(85, 6, 'Nueva Santa Rosa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(86, 7, 'Sololá', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(87, 7, 'San José Chacayá', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(88, 7, 'Santa María Visitación', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(89, 7, 'Santa Lucía Utatlán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(90, 7, 'Nahualá', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(91, 7, 'Santa Catarina Ixtahuacán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(92, 7, 'Santa Clara La Laguna', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(93, 7, 'Concepción', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(94, 7, 'San Andrés Semetabaj', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(95, 7, 'Panajachel', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(96, 7, 'Santa Catarina Palopó', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(97, 7, 'San Antonio Palopó', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(98, 7, 'San Lucas Tolimán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(99, 7, 'Santa Cruz La Laguna', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(100, 7, 'San Pablo La Laguna', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(101, 7, 'San Marcos La Laguna', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(102, 7, 'San Juan La Laguna', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(103, 7, 'San Pedro La Laguna', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(104, 7, 'Santiago Atitlán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(105, 8, 'Totonicapán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(106, 8, 'San Cristóbal Totonicapán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(107, 8, 'San Francisco El Alto', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(108, 8, 'San Andrés Xecul', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(109, 8, 'Momostenango', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(110, 8, 'Santa María Chiquimula', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(111, 8, 'Santa Lucía La Reforma', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(112, 8, 'San Bartolo', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(113, 9, 'Quetzaltenango', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(114, 9, 'Salcajá', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(115, 9, 'Olintepeque', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(116, 9, 'San Carlos Sija', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(117, 9, 'Sibilia', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(118, 9, 'Cabricán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(119, 9, 'Cajolá', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(120, 9, 'San Miguel Sigüilá', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(121, 9, 'San Juan Ostuncalco', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(122, 9, 'San Mateo', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(123, 9, 'Concepción Chiquirichapa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(124, 9, 'San Martín Sacatepéquez', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(125, 9, 'Almolonga', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(126, 9, 'Cantel', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(127, 9, 'Huitán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(128, 9, 'Zunil', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(129, 9, 'Colomba', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(130, 9, 'San Francisco La Unión', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(131, 9, 'El Palmar', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(132, 9, 'Coatepeque', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(133, 9, 'Génova', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(134, 9, 'Flores Costa Cuca', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(135, 9, 'La Esperanza', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(136, 9, 'Palestina de los Altos', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(137, 10, 'Mazatenango', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(138, 10, 'Cuyotenango', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(139, 10, 'San Francisco Zapotitlán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(140, 10, 'San Bernardino', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(141, 10, 'San José El Ídolo', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(142, 10, 'Santo Domingo Suchitepéquez', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(143, 10, 'San José La Máquina', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(144, 10, 'San Lorenzo', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(145, 10, 'Samayac', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(146, 10, 'San Pablo Jocopilas', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(147, 10, 'San Antonio Suchitepéquez', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(148, 10, 'San Miguel Panán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(149, 10, 'San Gabriel', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(150, 10, 'Chicacao', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(151, 10, 'Patulul', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(152, 10, 'Santa Bárbara', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(153, 10, 'San Juan Bautista', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(154, 10, 'Santo Tomás La Unión', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(155, 10, 'Zunilito', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(156, 10, 'Pueblo Nuevo', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(157, 10, 'Río Bravo', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(158, 11, 'Retalhuleu', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(159, 11, 'San Sebastián', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(160, 11, 'Santa Cruz Muluá', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(161, 11, 'San Martín Zapotitlán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(162, 11, 'San Felipe', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(163, 11, 'San Andrés Villa Seca', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(164, 11, 'Champerico', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(165, 11, 'Nuevo San Carlos', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(166, 11, 'El Asintal', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(167, 12, 'San Marcos', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(168, 12, 'San Pedro Sacatepéquez', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(169, 12, 'San Antonio Sacatepéquez', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(170, 12, 'Comitancillo', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(171, 12, 'San Miguel Ixtahuacán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(172, 12, 'Concepción Tutuapa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(173, 12, 'Tacaná', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(174, 12, 'Sibinal', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(175, 12, 'Tajumulco', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(176, 12, 'Tejutla', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(177, 12, 'San Rafael Pie de la Cuesta', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(178, 12, 'Nuevo Progreso', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(179, 12, 'El Tumbador', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(180, 12, 'El Rodeo', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(181, 12, 'Malacatán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(182, 12, 'Catarina', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(183, 12, 'Ayutla', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(184, 12, 'Ocós', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(185, 12, 'San Pablo', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(186, 12, 'El Quetzal', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(187, 12, 'La Reforma', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(188, 12, 'Pajapita', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(189, 12, 'Ixchiguán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(190, 12, 'San José Ojetenam', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(191, 12, 'San Cristóbal Cucho', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(192, 12, 'Sipacapa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(193, 12, 'Esquipulas Palo Gordo', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(194, 12, 'Río Blanco', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(195, 12, 'San Lorenzo', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(196, 12, 'La Blanca', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(197, 13, 'Huehuetenango', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(198, 13, 'Chiantla', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(199, 13, 'Malacatancito', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(200, 13, 'Cuilco', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(201, 13, 'Nentón', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(202, 13, 'San Pedro Necta', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(203, 13, 'Jacaltenango', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(204, 13, 'San Pedro Soloma', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(205, 13, 'San Ildefonso Ixtahuacán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(206, 13, 'Santa Bárbara', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(207, 13, 'La Libertad', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(208, 13, 'La Democracia', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(209, 13, 'San Miguel Acatán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(210, 13, 'San Rafael La Independencia', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(211, 13, 'Todos Santos Cuchumatán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(212, 13, 'San Juan Atitán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(213, 13, 'Santa Eulalia', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(214, 13, 'San Mateo Ixtatán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(215, 13, 'Colotenango', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(216, 13, 'San Sebastián Huehuetenango', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(217, 13, 'Tectitán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(218, 13, 'Concepción Huista', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(219, 13, 'San Juan Ixcoy', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(220, 13, 'San Antonio Huista', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(221, 13, 'San Sebastián Coatán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(222, 13, 'Santa Cruz Barillas', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(223, 13, 'Aguacatán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(224, 13, 'San Rafael Pétzal', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(225, 13, 'San Gaspar Ixchil', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(226, 13, 'Santiago Chimaltenango', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(227, 13, 'Santa Ana Huista', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(228, 13, 'Unión Cantinil', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(229, 13, 'Petatán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(230, 14, 'Santa Cruz del Quiché', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(231, 14, 'Chiché', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(232, 14, 'Chinique', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(233, 14, 'Zacualpa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(234, 14, 'Chajul', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(235, 14, 'Chichicastenango', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(236, 14, 'Patzité', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(237, 14, 'San Antonio Ilotenango', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(238, 14, 'San Pedro Jocopilas', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(239, 14, 'Cunén', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(240, 14, 'San Juan Cotzal', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(241, 14, 'Joyabaj', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(242, 14, 'Nebaj', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(243, 14, 'San Andrés Sajcabajá', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(244, 14, 'Uspantán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(245, 14, 'Sacapulas', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(246, 14, 'San Bartolomé Jocotenango', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(247, 14, 'Canillá', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(248, 14, 'Chicamán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(249, 14, 'Ixcán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(250, 14, 'Pachalum', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(251, 15, 'Salamá', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(252, 15, 'San Miguel Chicaj', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(253, 15, 'Rabinal', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(254, 15, 'Cubulco', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(255, 15, 'Granados', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(256, 15, 'El Chol', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(257, 15, 'San Jerónimo', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(258, 15, 'Purulhá', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(259, 16, 'Cobán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(260, 16, 'Santa Cruz Verapaz', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(261, 16, 'San Cristóbal Verapaz', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(262, 16, 'Tactic', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(263, 16, 'Tamahú', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(264, 16, 'Tucurú', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(265, 16, 'Panzós', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(266, 16, 'Senahú', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(267, 16, 'San Pedro Carchá', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(268, 16, 'San Juan Chamelco', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(269, 16, 'Lanquín', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(270, 16, 'Cahabón', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(271, 16, 'Chisec', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(272, 16, 'Chahal', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(273, 16, 'Fray Bartolomé de las Casas', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(274, 16, 'Santa Catalina La Tinta', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(275, 16, 'Raxruhá', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(276, 17, 'Flores', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(277, 17, 'San José', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(278, 17, 'San Benito', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(279, 17, 'San Andrés', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(280, 17, 'La Libertad', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(281, 17, 'San Francisco', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(282, 17, 'Santa Ana', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(283, 17, 'Dolores', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(284, 17, 'San Luis', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(285, 17, 'Sayaxché', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(286, 17, 'Melchor de Mencos', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(287, 17, 'Poptún', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(288, 17, 'Las Cruces', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(289, 17, 'El Chal', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(290, 18, 'Puerto Barrios', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(291, 18, 'Livingston', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(292, 18, 'El Estor', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(293, 18, 'Morales', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(294, 18, 'Los Amates', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(295, 19, 'Zacapa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(296, 19, 'Estanzuela', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(297, 19, 'Río Hondo', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(298, 19, 'Gualán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(299, 19, 'Teculután', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(300, 19, 'Usumatlán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(301, 19, 'Cabañas', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(302, 19, 'San Diego', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(303, 19, 'La Unión', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(304, 19, 'Huité', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(305, 19, 'San Jorge', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(306, 20, 'Chiquimula', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(307, 20, 'San José La Arada', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(308, 20, 'San Juan Ermita', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(309, 20, 'Jocotán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(310, 20, 'Camotán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(311, 20, 'Olopa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(312, 20, 'Esquipulas', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(313, 20, 'Concepción Las Minas', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(314, 20, 'Quetzaltepeque', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(315, 20, 'San Jacinto', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(316, 20, 'Ipala', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(317, 21, 'Jalapa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(318, 21, 'San Pedro Pinula', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(319, 21, 'San Luis Jilotepeque', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(320, 21, 'San Manuel Chaparrón', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(321, 21, 'San Carlos Alzatate', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(322, 21, 'Monjas', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(323, 21, 'Mataquescuintla', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(324, 22, 'Jutiapa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(325, 22, 'El Progreso', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(326, 22, 'Santa Catarina Mita', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(327, 22, 'Agua Blanca', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(328, 22, 'Asunción Mita', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(329, 22, 'Yupiltepeque', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(330, 22, 'Atescatempa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(331, 22, 'Jerez', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(332, 22, 'El Adelanto', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(333, 22, 'Zapotitlán', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(334, 22, 'Comapa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(335, 22, 'Jalpatagua', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(336, 22, 'Conguaco', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(337, 22, 'Moyuta', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(338, 22, 'Pasaco', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(339, 22, 'San José Acatempa', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(340, 22, 'Quesada', '2025-05-30 01:48:47', '2025-05-30 01:48:47'),
(341, 13, 'La Mesilla', '2025-05-30 02:30:45', '2025-05-30 02:30:45'),
(342, 8, 'Pologua', '2025-05-30 02:42:44', '2025-05-30 02:42:44'),
(343, 8, 'Rancho de Teja', '2025-05-30 02:42:44', '2025-05-30 02:42:44');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Pagos`
--

CREATE TABLE `Pagos` (
  `id_pago` int NOT NULL,
  `id_pedido` int NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_pago` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `metodo_pago` enum('efectivo','tarjeta','transferencia') DEFAULT 'efectivo',
  `referencia` varchar(100) DEFAULT NULL,
  `id_usuario` int NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Pedidos`
--

CREATE TABLE `Pedidos` (
  `id_pedido` int NOT NULL,
  `id_cliente` int NOT NULL,
  `id_usuario` int NOT NULL,
  `fecha_pedido` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `pedido_entregado` enum('si','no') DEFAULT 'no',
  `total_pedido` decimal(10,2) DEFAULT '0.00',
  `fecha_entrega` timestamp NULL DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Usuarios`
--

CREATE TABLE `Usuarios` (
  `id_usuario` int NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nombre_usuario` varchar(100) NOT NULL,
  `telefono_usuario` varchar(20) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `activo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `Usuarios`
--

INSERT INTO `Usuarios` (`id_usuario`, `usuario`, `password`, `nombre_usuario`, `telefono_usuario`, `fecha_creacion`, `fecha_modificacion`, `activo`) VALUES
(1, 'HUEsamuelrm', 'Samprs258', 'Samuel Ramirez', '49617032', '2025-05-30 01:34:06', '2025-05-30 01:34:06', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `Bodegas`
--
ALTER TABLE `Bodegas`
  ADD PRIMARY KEY (`id_bodega`),
  ADD KEY `usuario_bodega` (`usuario_bodega`);

--
-- Indices de la tabla `Clientes`
--
ALTER TABLE `Clientes`
  ADD PRIMARY KEY (`id_cliente`),
  ADD KEY `id_gira` (`id_gira`),
  ADD KEY `id_gira_municipio` (`id_gira_municipio`);

--
-- Indices de la tabla `Departamento`
--
ALTER TABLE `Departamento`
  ADD PRIMARY KEY (`id_departamento`),
  ADD UNIQUE KEY `nombre_departamento` (`nombre_departamento`);

--
-- Indices de la tabla `Detalles_Pedidos`
--
ALTER TABLE `Detalles_Pedidos`
  ADD PRIMARY KEY (`id_detalle_pedido`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_inventario` (`id_inventario`),
  ADD KEY `id_medicamento` (`id_medicamento`);

--
-- Indices de la tabla `Giras`
--
ALTER TABLE `Giras`
  ADD PRIMARY KEY (`id_gira`),
  ADD KEY `id_departamento` (`id_departamento`);

--
-- Indices de la tabla `Gira_Municipio`
--
ALTER TABLE `Gira_Municipio`
  ADD PRIMARY KEY (`id_gira_municipio`),
  ADD UNIQUE KEY `unique_gira_municipio` (`id_gira`,`id_municipio`),
  ADD KEY `id_municipio` (`id_municipio`);

--
-- Indices de la tabla `Historial_Precios`
--
ALTER TABLE `Historial_Precios`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `id_medicamento` (`id_medicamento`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `Inventario_Bodega`
--
ALTER TABLE `Inventario_Bodega`
  ADD PRIMARY KEY (`id_inventario`),
  ADD UNIQUE KEY `unique_medicamento_bodega` (`id_medicamento`,`id_bodega`),
  ADD KEY `id_bodega` (`id_bodega`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `Medicamento`
--
ALTER TABLE `Medicamento`
  ADD PRIMARY KEY (`id_medicamento`);

--
-- Indices de la tabla `Movimientos_Inventario`
--
ALTER TABLE `Movimientos_Inventario`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `id_inventario` (`id_inventario`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_pedido` (`id_pedido`);

--
-- Indices de la tabla `Municipio`
--
ALTER TABLE `Municipio`
  ADD PRIMARY KEY (`id_municipio`),
  ADD UNIQUE KEY `unique_municipio_departamento` (`nombre_municipio`,`id_departamento`),
  ADD KEY `id_departamento` (`id_departamento`);

--
-- Indices de la tabla `Pagos`
--
ALTER TABLE `Pagos`
  ADD PRIMARY KEY (`id_pago`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `Pedidos`
--
ALTER TABLE `Pedidos`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `Usuarios`
--
ALTER TABLE `Usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `usuario` (`usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `Bodegas`
--
ALTER TABLE `Bodegas`
  MODIFY `id_bodega` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `Clientes`
--
ALTER TABLE `Clientes`
  MODIFY `id_cliente` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Departamento`
--
ALTER TABLE `Departamento`
  MODIFY `id_departamento` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `Detalles_Pedidos`
--
ALTER TABLE `Detalles_Pedidos`
  MODIFY `id_detalle_pedido` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Historial_Precios`
--
ALTER TABLE `Historial_Precios`
  MODIFY `id_historial` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Inventario_Bodega`
--
ALTER TABLE `Inventario_Bodega`
  MODIFY `id_inventario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `Movimientos_Inventario`
--
ALTER TABLE `Movimientos_Inventario`
  MODIFY `id_movimiento` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Municipio`
--
ALTER TABLE `Municipio`
  MODIFY `id_municipio` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=344;

--
-- AUTO_INCREMENT de la tabla `Pagos`
--
ALTER TABLE `Pagos`
  MODIFY `id_pago` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Pedidos`
--
ALTER TABLE `Pedidos`
  MODIFY `id_pedido` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Usuarios`
--
ALTER TABLE `Usuarios`
  MODIFY `id_usuario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `Bodegas`
--
ALTER TABLE `Bodegas`
  ADD CONSTRAINT `Bodegas_ibfk_1` FOREIGN KEY (`usuario_bodega`) REFERENCES `Usuarios` (`id_usuario`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `Clientes`
--
ALTER TABLE `Clientes`
  ADD CONSTRAINT `Clientes_ibfk_1` FOREIGN KEY (`id_gira`) REFERENCES `Giras` (`id_gira`) ON DELETE RESTRICT,
  ADD CONSTRAINT `Clientes_ibfk_2` FOREIGN KEY (`id_gira_municipio`) REFERENCES `Gira_Municipio` (`id_gira_municipio`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `Detalles_Pedidos`
--
ALTER TABLE `Detalles_Pedidos`
  ADD CONSTRAINT `Detalles_Pedidos_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `Pedidos` (`id_pedido`) ON DELETE CASCADE,
  ADD CONSTRAINT `Detalles_Pedidos_ibfk_2` FOREIGN KEY (`id_inventario`) REFERENCES `Inventario_Bodega` (`id_inventario`) ON DELETE RESTRICT,
  ADD CONSTRAINT `Detalles_Pedidos_ibfk_3` FOREIGN KEY (`id_medicamento`) REFERENCES `Medicamento` (`id_medicamento`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `Giras`
--
ALTER TABLE `Giras`
  ADD CONSTRAINT `Giras_ibfk_1` FOREIGN KEY (`id_departamento`) REFERENCES `Departamento` (`id_departamento`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `Gira_Municipio`
--
ALTER TABLE `Gira_Municipio`
  ADD CONSTRAINT `Gira_Municipio_ibfk_1` FOREIGN KEY (`id_gira`) REFERENCES `Giras` (`id_gira`) ON DELETE CASCADE,
  ADD CONSTRAINT `Gira_Municipio_ibfk_2` FOREIGN KEY (`id_municipio`) REFERENCES `Municipio` (`id_municipio`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `Historial_Precios`
--
ALTER TABLE `Historial_Precios`
  ADD CONSTRAINT `Historial_Precios_ibfk_1` FOREIGN KEY (`id_medicamento`) REFERENCES `Medicamento` (`id_medicamento`) ON DELETE CASCADE,
  ADD CONSTRAINT `Historial_Precios_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `Usuarios` (`id_usuario`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `Inventario_Bodega`
--
ALTER TABLE `Inventario_Bodega`
  ADD CONSTRAINT `Inventario_Bodega_ibfk_1` FOREIGN KEY (`id_bodega`) REFERENCES `Bodegas` (`id_bodega`) ON DELETE RESTRICT,
  ADD CONSTRAINT `Inventario_Bodega_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `Usuarios` (`id_usuario`) ON DELETE RESTRICT,
  ADD CONSTRAINT `Inventario_Bodega_ibfk_3` FOREIGN KEY (`id_medicamento`) REFERENCES `Medicamento` (`id_medicamento`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `Movimientos_Inventario`
--
ALTER TABLE `Movimientos_Inventario`
  ADD CONSTRAINT `Movimientos_Inventario_ibfk_1` FOREIGN KEY (`id_inventario`) REFERENCES `Inventario_Bodega` (`id_inventario`) ON DELETE RESTRICT,
  ADD CONSTRAINT `Movimientos_Inventario_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `Usuarios` (`id_usuario`) ON DELETE RESTRICT,
  ADD CONSTRAINT `Movimientos_Inventario_ibfk_3` FOREIGN KEY (`id_pedido`) REFERENCES `Pedidos` (`id_pedido`) ON DELETE SET NULL;

--
-- Filtros para la tabla `Municipio`
--
ALTER TABLE `Municipio`
  ADD CONSTRAINT `Municipio_ibfk_1` FOREIGN KEY (`id_departamento`) REFERENCES `Departamento` (`id_departamento`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `Pagos`
--
ALTER TABLE `Pagos`
  ADD CONSTRAINT `Pagos_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `Pedidos` (`id_pedido`) ON DELETE RESTRICT,
  ADD CONSTRAINT `Pagos_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `Usuarios` (`id_usuario`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `Pedidos`
--
ALTER TABLE `Pedidos`
  ADD CONSTRAINT `Pedidos_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `Clientes` (`id_cliente`) ON DELETE RESTRICT,
  ADD CONSTRAINT `Pedidos_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `Usuarios` (`id_usuario`) ON DELETE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
