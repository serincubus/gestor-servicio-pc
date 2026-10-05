var express = require('express');
var router = express.Router();
const historyController = require('../controllers/historyController');
const { esStaff, esAdmin } = require('../middlewares/authMiddleware');
const requireComercio = require('../middlewares/requireComercio');

// 🔒 RUTA DE HISTORIAL PROTEGIDA: Solo accesible para personal del taller con rango Administrador
router.get('/historial', requireComercio, esStaff, esAdmin, historyController.verHistorial);

module.exports = router;
