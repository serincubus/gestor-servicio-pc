var express = require('express');
var router = express.Router();
const indexControllers = require('../controllers/indexControllers')

/* GET home page. */
router.get('/', indexControllers.index);
router.post('/guardar', indexControllers.store); // <--- Esta vincula el botón con la base de datos
router.get('/editar/:id_cliente', indexControllers.edit);
router.post('/actualizar/:id_cliente', indexControllers.update);
router.get('/eliminar/:id_cliente', indexControllers.delete);
router.get('/detalle/:id_cliente', indexControllers.detalle);
router.post('/actualizar-estado/:id_cliente', indexControllers.updateStatus);
router.get('/history', indexControllers.history);




module.exports = router;
