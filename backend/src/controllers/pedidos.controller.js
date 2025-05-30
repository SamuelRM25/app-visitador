const { pool } = require('../config/db');

exports.crearPedido = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id_cliente, detalles } = req.body;
    const id_usuario = req.user.id;
    
    // Crear pedido
    const [resultPedido] = await connection.execute(
      'INSERT INTO Pedidos (id_cliente, id_usuario) VALUES (?, ?)',
      [id_cliente, id_usuario]
    );
    
    const id_pedido = resultPedido.insertId;
    
    // Procesar detalles del pedido
    for (const detalle of detalles) {
      const { id_inventario, id_medicamento, cantidad_medicamento } = detalle;
      
      // Verificar inventario disponible
      const [inventario] = await connection.execute(
        'SELECT cantidad_medicamento FROM Inventario_Bodega WHERE id_inventario = ?',
        [id_inventario]
      );
      
      if (!inventario[0] || inventario[0].cantidad_medicamento < cantidad_medicamento) {
        throw new Error(`Inventario insuficiente para el medicamento ${id_medicamento}`);
      }
      
      // Obtener precio del medicamento
      const [medicamento] = await connection.execute(
        'SELECT precio_medicamento FROM Medicamento WHERE id_medicamento = ?',
        [id_medicamento]
      );
      
      const precio_unitario = medicamento[0].precio_medicamento;
      const subtotal = precio_unitario * cantidad_medicamento;
      
      // Insertar detalle del pedido
      await connection.execute(
        'INSERT INTO Detalles_Pedidos (id_pedido, id_inventario, id_medicamento, cantidad_medicamento, precio_unitario, subtotal_medicamento) VALUES (?, ?, ?, ?, ?, ?)',
        [id_pedido, id_inventario, id_medicamento, cantidad_medicamento, precio_unitario, subtotal]
      );
      
      // Actualizar inventario (esto también lo hace el trigger)
      await connection.execute(
        'UPDATE Inventario_Bodega SET cantidad_medicamento = cantidad_medicamento - ? WHERE id_inventario = ?',
        [cantidad_medicamento, id_inventario]
      );
    }
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: { id_pedido }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear pedido',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  } finally {
    connection.release();
  }
};

exports.getPedidos = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.id_pedido, p.fecha_pedido, p.pedido_entregado, p.total_pedido, 
n      c.nombre_cliente, c.telefono_cliente, u.nombre_usuario as vendedor
n      FROM Pedidos p
n      JOIN Clientes c ON p.id_cliente = c.id_cliente
n      JOIN Usuarios u ON p.id_usuario = u.id_usuario
n      ORDER BY p.fecha_pedido DESC`
    );
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener información del pedido
    const [pedido] = await pool.execute(
      `SELECT p.id_pedido, p.fecha_pedido, p.pedido_entregado, p.total_pedido, 
n      c.id_cliente, c.nombre_cliente, c.telefono_cliente, 
n      u.nombre_usuario as vendedor
n      FROM Pedidos p
n      JOIN Clientes c ON p.id_cliente = c.id_cliente
n      JOIN Usuarios u ON p.id_usuario = u.id_usuario
n      WHERE p.id_pedido = ?`,
      [id]
    );
    
    if (pedido.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }
    
    // Obtener detalles del pedido
    const [detalles] = await pool.execute(
      `SELECT dp.id_detalle_pedido, dp.id_medicamento, m.nombre_medicamento,
n      m.presentacion_medicamento, dp.cantidad_medicamento, dp.precio_unitario,
n      dp.subtotal_medicamento, dp.estado_pedido
n      FROM Detalles_Pedidos dp
n      JOIN Medicamento m ON dp.id_medicamento = m.id_medicamento
n      WHERE dp.id_pedido = ?`,
      [id]
    );
    
    // Obtener pagos del pedido
    const [pagos] = await pool.execute(
      `SELECT id_pago, monto, fecha_pago, metodo_pago, referencia
n      FROM Pagos
n      WHERE id_pedido = ?`,
      [id]
    );
    
    res.status(200).json({
      success: true,
      data: {
        ...pedido[0],
        detalles,
        pagos
      }
    });
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles del pedido',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.registrarPago = async (req, res) => {
  try {
    const { id_pedido } = req.params;
    const { monto, metodo_pago, referencia } = req.body;
    const id_usuario = req.user.id;
    
    // Verificar que el pedido existe
    const [pedido] = await pool.execute(
      'SELECT total_pedido FROM Pedidos WHERE id_pedido = ?',
      [id_pedido]
    );
    
    if (pedido.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }
    
    // Verificar total pagado hasta ahora
    const [pagos] = await pool.execute(
      'SELECT COALESCE(SUM(monto), 0) as total_pagado FROM Pagos WHERE id_pedido = ?',
      [id_pedido]
    );
    
    const total_pedido = pedido[0].total_pedido;
    const total_pagado = pagos[0].total_pagado;
    
    if (total_pagado + parseFloat(monto) > total_pedido) {
      return res.status(400).json({
        success: false,
        message: 'El monto del pago excede el saldo pendiente'
      });
    }
    
    // Registrar pago
    const [result] = await pool.execute(
      'INSERT INTO Pagos (id_pedido, monto, metodo_pago, referencia, id_usuario) VALUES (?, ?, ?, ?, ?)',
      [id_pedido, monto, metodo_pago, referencia, id_usuario]
    );
    
    // Si el pedido está completamente pagado, actualizar estado de los detalles
    if (total_pagado + parseFloat(monto) >= total_pedido) {
      await pool.execute(
        'UPDATE Detalles_Pedidos SET estado_pedido = "pagado" WHERE id_pedido = ? AND estado_pedido = "abonado"',
        [id_pedido]
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Pago registrado exitosamente',
      data: {
        id_pago: result.insertId,
        monto,
        metodo_pago,
        referencia
      }
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar pago',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

exports.marcarEntregado = async (req, res) => {
  try {
    const { id_pedido } = req.params;
    
    // Verificar que el pedido existe
    const [pedido] = await pool.execute(
      'SELECT pedido_entregado FROM Pedidos WHERE id_pedido = ?',
      [id_pedido]
    );
    
    if (pedido.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }
    
    if (pedido[0].pedido_entregado === 'si') {
      return res.status(400).json({
        success: false,
        message: 'El pedido ya está marcado como entregado'
      });
    }
    
    // Marcar pedido como entregado
    await pool.execute(
      'UPDATE Pedidos SET pedido_entregado = "si", fecha_entrega = CURRENT_TIMESTAMP WHERE id_pedido = ?',
      [id_pedido]
    );
    
    // Marcar todos los detalles como entregados
    await pool.execute(
      'UPDATE Detalles_Pedidos SET estado_pedido = "entregado" WHERE id_pedido = ?',
      [id_pedido]
    );
    
    res.status(200).json({
      success: true,
      message: 'Pedido marcado como entregado exitosamente'
    });
  } catch (error) {
    console.error('Error al marcar pedido como entregado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar pedido como entregado',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};