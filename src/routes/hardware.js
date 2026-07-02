const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const hardwareController = require('../controllers/hardwareController');

// --- CONFIGURACIÓN DE ALMACENAMIENTO DE MULTER ---
const storage = multer.diskStorage({
    // 1. Definimos la carpeta de destino física en el servidor
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/images/hardware'));
    },
    // 2. Renombramos el archivo de forma única: fecha-nombreOriginal
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Mantiene la extensión original del archivo (.png, .jpg, etc.)
        cb(null, 'hw-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// --- FILTRO DE SEGURIDAD PARA IMÁGENES ---
const fileFilter = (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true); // Archivo aceptado
    } else {
        cb(new Error('Formato de imagen no válido. Solo se permite JPG, JPEG, PNG y WEBP.'), false);
    }
};

// Inicializamos el middleware Multer con los parámetros configurados
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 3 * 1024 * 1024 } // Límite máximo de tamaño: 3 Megabytes por foto
});

// CRUD Hardware
router.get('/', hardwareController.index);
router.post('/guardar',upload.single('imagen'), hardwareController.store);
router.get('/editar/:id', hardwareController.edit);
router.post('/editar/:id', upload.single('imagen'),hardwareController.update);
router.post('/eliminar/:id', hardwareController.delete);

module.exports = router;
