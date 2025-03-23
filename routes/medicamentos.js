const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const multer = require('multer');
const path = require('fs');
const fs = require('fs');

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/medicamentos';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `med_${req.params.id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

// Obtener todos los medicamentos
router.get('/', async (req, res) => {
  try {
    const [medicamentos] = await pool.query('SELECT * FROM medicamentos');
    res.json({ success: true, data: medicamentos });
  } catch (error) {
    console.error('Error al obtener medicamentos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener medicamentos' });
  }
});

// Obtener un medicamento por ID
router.get('/:id', async (req, res) => {
  try {
    const [medicamentos] = await pool.query(
      'SELECT * FROM medicamentos WHERE id_medicamento = ?',
      [req.params.id]
    );
    
    if (medicamentos.length === 0) {
      return res.status(404).json({ success: false, message: 'Medicamento no encontrado' });
    }
    
    res.json({ success: true, data: medicamentos[0] });
  } catch (error) {
    console.error('Error al obtener medicamento:', error);
    res.status(500).json({ success: false, message: 'Error al obtener medicamento' });
  }
});

// Crear un nuevo medicamento
router.post('/', async (req, res) => {
  try {
    const { codigo_medicamento, nombre_medicamento, presentacion, descripcion, precio_unitario } = req.body;
    
    // Validar datos requeridos
    if (!codigo_medicamento || !nombre_medicamento || !presentacion || !precio_unitario) {
      return res.status(400).json({ 
        success: false, 
        message: 'Datos incompletos. Se requiere código, nombre, presentación y precio.' 
      });
    }
    
    const [result] = await pool.query(
      `INSERT INTO medicamentos 
       (codigo_medicamento, nombre_medicamento, presentacion, descripcion, precio_unitario) 
       VALUES (?, ?, ?, ?, ?)`,
      [codigo_medicamento, nombre_medicamento, presentacion, descripcion || '', precio_unitario]
    );
    
    // Obtener el medicamento recién creado
    const [medicamentos] = await pool.query(
      'SELECT * FROM medicamentos WHERE id_medicamento = ?',
      [result.insertId]
    );
    
    res.status(201).json({ success: true, data: medicamentos[0] });
  } catch (error) {
    console.error('Error al crear medicamento:', error);
    res.status(500).json({ success: false, message: 'Error al crear medicamento' });
  }
});

// Actualizar un medicamento
router.patch('/:id', async (req, res) => {
  try {
    const { codigo_medicamento, nombre_medicamento, presentacion, descripcion, precio_unitario } = req.body;
    
    // Verificar si el medicamento existe
    const [existingMed] = await pool.query(
      'SELECT * FROM medicamentos WHERE id_medicamento = ?',
      [req.params.id]
    );
    
    if (existingMed.length === 0) {
      return res.status(404).json({ success: false, message: 'Medicamento no encontrado' });
    }
    
    // Construir la consulta dinámica para actualizar solo los campos proporcionados
    let updateQuery = 'UPDATE medicamentos SET ';
    const updateValues = [];
    const updateFields = [];
    
    if (codigo_medicamento !== undefined) {
      updateFields.push('codigo_medicamento = ?');
      updateValues.push(codigo_medicamento);
    }
    
    if (nombre_medicamento !== undefined) {
      updateFields.push('nombre_medicamento = ?');
      updateValues.push(nombre_medicamento);
    }
    
    if (presentacion !== undefined) {
      updateFields.push('presentacion = ?');
      updateValues.push(presentacion);
    }
    
    if (descripcion !== undefined) {
      updateFields.push('descripcion = ?');
      updateValues.push(descripcion);
    }
    
    if (precio_unitario !== undefined) {
      updateFields.push('precio_unitario = ?');
      updateValues.push(precio_unitario);
    }
    
    // Agregar updated_at
    updateFields.push('updated_at = NOW()');
    
    // Si no hay campos para actualizar
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No se proporcionaron campos para actualizar' });
    }
    
    updateQuery += updateFields.join(', ') + ' WHERE id_medicamento = ?';
    updateValues.push(req.params.id);
    
    await pool.query(updateQuery, updateValues);
    
    // Obtener el medicamento actualizado
    const [medicamentos] = await pool.query(
      'SELECT * FROM medicamentos WHERE id_medicamento = ?',
      [req.params.id]
    );
    
    res.json({ success: true, data: medicamentos[0] });
  } catch (error) {
    console.error('Error al actualizar medicamento:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar medicamento' });
  }
});

// Eliminar un medicamento
router.delete('/:id', async (req, res) => {
  try {
    // Verificar si el medicamento existe
    const [existingMed] = await pool.query(
      'SELECT * FROM medicamentos WHERE id_medicamento = ?',
      [req.params.id]
    );
    
    if (existingMed.length === 0) {
      return res.status(404).json({ success: false, message: 'Medicamento no encontrado' });
    }
    
    // Eliminar el medicamento
    await pool.query('DELETE FROM medicamentos WHERE id_medicamento = ?', [req.params.id]);
    
    // Eliminar la imagen asociada si existe
    const imagePath = `./uploads/medicamentos/med_${req.params.id}_`;
    try {
      const files = fs.readdirSync('./uploads/medicamentos');
      const imageFile = files.find(file => file.startsWith(`med_${req.params.id}_`));
      if (imageFile) {
        fs.unlinkSync(`./uploads/medicamentos/${imageFile}`);
      }
    } catch (err) {
      console.error('Error al eliminar imagen:', err);
      // Continuamos con la respuesta aunque falle la eliminación de la imagen
    }
    
    res.json({ success: true, message: 'Medicamento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar medicamento:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar medicamento' });
  }
});

// Obtener la imagen de un medicamento
router.get('/:id/imagen', async (req, res) => {
  try {
    // Verificar si el medicamento existe
    const [existingMed] = await pool.query(
      'SELECT * FROM medicamentos WHERE id_medicamento = ?',
      [req.params.id]
    );
    
    if (existingMed.length === 0) {
      return res.status(404).json({ success: false, message: 'Medicamento no encontrado' });
    }
    
    // Buscar la imagen asociada
    const dir = './uploads/medicamentos';
    if (!fs.existsSync(dir)) {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
    }
    
    const files = fs.readdirSync(dir);
    const imageFile = files.find(file => file.startsWith(`med_${req.params.id}_`));
    
    if (!imageFile) {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
    }
    
    // Enviar la imagen
    res.sendFile(path.resolve(`${dir}/${imageFile}`));
  } catch (error) {
    console.error('Error al obtener imagen:', error);
    res.status(500).json({ success: false, message: 'Error al obtener imagen' });
  }
});

// Subir o actualizar la imagen de un medicamento
router.post('/:id/imagen', upload.single('imagen'), async (req, res) => {
  try {
    // Verificar si el medicamento existe
    const [existingMed] = await pool.query(
      'SELECT * FROM medicamentos WHERE id_medicamento = ?',
      [req.params.id]
    );
    
    if (existingMed.length === 0) {
      // Si ya se subió la imagen, eliminarla
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'Medicamento no encontrado' });
    }
    
    // Si no hay archivo
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se proporcionó ninguna imagen' });
    }
    
    // Eliminar imagen anterior si existe
    try {
      const files = fs.readdirSync('./uploads/medicamentos');
      const oldImageFile = files.find(file => file.startsWith(`med_${req.params.id}_`) && file !== req.file.filename);
      if (oldImageFile) {
        fs.unlinkSync(`./uploads/medicamentos/${oldImageFile}`);
      }
    } catch (err) {
      console.error('Error al eliminar imagen anterior:', err);
      // Continuamos aunque falle la eliminación de la imagen anterior
    }
    
    res.json({ 
      success: true, 
      message: 'Imagen subida correctamente',
      data: {
        filename: req.file.filename,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ success: false, message: 'Error al subir imagen' });
  }
});

module.exports = router;
