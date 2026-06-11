var express = require('express');
var router = express.Router();
const indexControllers = require('../controllers/indexControllers')
const userControllers = require('../controllers/userControllers');

// FUNCIÓN CANDADO ACTUALIZADA: Si no está logueado, lo manda a /users/login
function soloAdmin(req, res, next) {
    if (req.session && req.session.esAdmin) {
        return next();
    }
    res.redirect('/users/login'); // <-- Redirección corregida a la nueva ruta
}

/* RUTAS PÚBLICAS DE CONSULTA PARA CLIENTES */
router.get('/consulta', indexControllers.consultaReparacion);
router.post('/consulta', indexControllers.buscarEstadoCliente);

/* GET home page. */
router.get('/', soloAdmin,indexControllers.index);
router.post('/guardar', soloAdmin, indexControllers.store); // <--- Esta vincula el botón con la base de datos
router.get('/editar/:id_cliente', soloAdmin, indexControllers.edit);
router.post('/actualizar/:id_cliente', soloAdmin, indexControllers.update);
router.get('/eliminar/:id_cliente', soloAdmin, indexControllers.delete);
router.get('/detalle/:id_cliente', soloAdmin, indexControllers.detalle);
router.post('/actualizar-estado/:id_cliente', soloAdmin, indexControllers.updateStatus);
router.get('/history', soloAdmin, indexControllers.history);
router.get('/search', soloAdmin, indexControllers.search); // <--- Ruta para búsqueda



module.exports = router;
