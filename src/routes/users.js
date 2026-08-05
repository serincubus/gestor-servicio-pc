var express = require('express');
var router = express.Router();

// routes/users.js
var express = require('express');
var router = express.Router();
const userControllers = require('../controllers/userControllers');
const userManagementController = require('../controllers/userManagementController');
const { esStaff, esAdmin } = require('../middlewares/authMiddleware');

/* TODAS ESTAS RUTAS SE EXECUTAN ANTES CON EL PREFIJO /users */

// Muestra el formulario de login (Entrarás por http://localhost:3000/users/login)
router.get('/login', userControllers.loginVista);

// Procesa la contraseña
router.post('/login', userControllers.procesarLogin);

// Cierra la sesión
router.get('/logout', userControllers.logout);

// 🔒 CRUD DE USUARIOS TÉCNICOS (Protegido para Administradores)
router.get('/management', esStaff, esAdmin, userManagementController.index);
router.post('/management/guardar', esStaff, esAdmin, userManagementController.store);
router.get('/management/editar/:id', esStaff, esAdmin, userManagementController.edit);
router.post('/management/editar/:id', esStaff, esAdmin, userManagementController.update);
router.post('/management/eliminar/:id', esStaff, esAdmin, userManagementController.delete);



module.exports = router;
