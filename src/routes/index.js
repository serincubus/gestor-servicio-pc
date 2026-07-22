var express = require('express');
var router = express.Router();
const indexControllers = require('../controllers/indexControllers');
const userControllers = require('../controllers/userControllers');
const { esStaff, esAdmin } = require('../middlewares/authMiddleware');

// FUNCIÓN CANDADO ACTUALIZADA: Si no está logueado, lo manda a /users/login


/* RUTAS PÚBLICAS DE CONSULTA PARA CLIENTES */
router.get('/consulta', indexControllers.consultaReparacion);
router.post('/consulta', indexControllers.buscarEstadoCliente);

/* --- FLUJO DE TRABAJO TÉCNICO COMPARTIDO (ADMINISTRADORES Y PERSONAL STAFF) --- */
// El personal técnico con menor jerarquía tiene permisos de visualización, creación y edición
router.get('/', esStaff, indexControllers.index);
router.post('/guardar', esStaff, indexControllers.store);
router.get('/search', esStaff, indexControllers.search);
router.get('/detalle/:id_cliente', esStaff, indexControllers.detalle);
router.get('/editar/:id_cliente', esStaff, indexControllers.edit);
router.post('/actualizar/:id_cliente', esStaff, indexControllers.update);
router.post('/actualizar-estado/:id_cliente', esStaff, indexControllers.updateStatus);

/* --- FLUJO FINANCIERO Y CONTROL DE SEGURIDAD EXCLUSIVO (SOLO ADMINISTRADORES) --- */
// Las acciones críticas de remoción y el historial de cajas quedan estrictamente blindadas bajo el middleware esAdmin
router.post('/eliminar/:id_cliente', esStaff, esAdmin, indexControllers.delete);
router.get('/history', esStaff, esAdmin, indexControllers.history);

module.exports = router;
