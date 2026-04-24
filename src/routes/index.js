var express = require('express');
var router = express.Router();
const indexControllers = require('../controllers/indexControllers')

/* GET home page. */
router.get('/', indexControllers.index);
router.post('/guardar', indexControllers.store); // <--- Esta vincula el botón con la base de datos

module.exports = router;
