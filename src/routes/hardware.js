const express = require('express');
const router = express.Router();
const hardwareController = require('../controllers/hardwareController');

// CRUD Hardware
router.get('/', hardwareController.index);
router.post('/guardar', hardwareController.store);
router.get('/editar/:id', hardwareController.edit);
router.post('/editar/:id', hardwareController.update);
router.post('/eliminar/:id', hardwareController.delete);

module.exports = router;
