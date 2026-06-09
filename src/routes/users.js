var express = require('express');
var router = express.Router();

// routes/users.js
var express = require('express');
var router = express.Router();
const userControllers = require('../controllers/userControllers');

/* TODAS ESTAS RUTAS SE EXECUTAN ANTES CON EL PREFIJO /users */

// Muestra el formulario de login (Entrarás por http://localhost:3000/users/login)
router.get('/login', userControllers.loginVista);

// Procesa la contraseña
router.post('/login', userControllers.procesarLogin);

// Cierra la sesión
router.get('/logout', userControllers.logout);

module.exports = router;


module.exports = router;
