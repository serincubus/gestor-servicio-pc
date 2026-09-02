var express = require('express');
var router = express.Router();
const path = require('path'); 
const multer = require('multer'); // ⬅️ ¡ESTA LÍNEA DEBE SER LA NÚMERO 4 SÍ O SÍ!

// routes/users.js
var express = require('express');
var router = express.Router();
const userControllers = require('../controllers/userControllers');
const userManagementController = require('../controllers/userManagementController');
const { esStaff, esAdmin } = require('../middlewares/authMiddleware');

// 🛠️ CONFIGURACIÓN DE ALMACENAMIENTO DE AVATARES CON MULTER
const storageUser = multer.diskStorage({
    destination: (req, file, cb) => {
        // Guarda los avatares en la carpeta destinada a imágenes de usuarios
        cb(null, path.join(__dirname, '../../public/images/users'));
    },
    filename: (req, file, cb) => {
        // Genera un nombre único anteponiendo la fecha actual: ej: user-1714572000-avatar.jpg
        const uniqueSuffix = 'user-' + Date.now() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});

// Middleware de Multer listo para filtrar y atrapar la foto del formulario
const uploadUserFoto = multer({ 
    storage: storageUser,
    fileFilter: (req, file, cb) => {
        // Validación de seguridad de formato: Solo acepta JPEG, JPG o PNG
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: El catálogo solo admite imágenes con extensión .png, .jpg o .jpeg'));
    }
});


/* TODAS ESTAS RUTAS SE EXECUTAN ANTES CON EL PREFIJO /users */

// Muestra el formulario de login (Entrarás por http://localhost:3000/users/login)
router.get('/login', userControllers.loginVista);

// Procesa la contraseña
router.post('/login', userControllers.procesarLogin);

// Cierra la sesión
router.get('/logout', userControllers.logout);

// 🔒 CRUD DE USUARIOS TÉCNICOS (Protegido para Administradores)
router.get('/management', esStaff, esAdmin, userManagementController.index);
router.post('/management/guardar', esStaff, esAdmin, uploadUserFoto.single('foto'), userManagementController.store);
router.get('/management/editar/:id', esStaff, esAdmin, userManagementController.edit);
router.post('/management/editar/:id', esStaff, esAdmin, uploadUserFoto.single('foto'), userManagementController.update,);
router.post('/management/eliminar/:id', esStaff, esAdmin, uploadUserFoto.single('foto'), userManagementController.delete);



module.exports = router;
