// src/routes/saas.js
const express = require('express');
const router = express.Router();
const saasController = require('../controllers/saasController');

const esSuperAdminMiddleware = (req, res, next) => {
    if (req.session.usuarioLogueado && req.session.usuarioLogueado.rol === 'superadmin') {
        return next();
    }
    return res.redirect('/?errorPermiso=true');
};

// Rutas de la Consola Maestra SaaS activas
router.get('/panel', esSuperAdminMiddleware, saasController.panel);
router.post('/comercios/guardar-completo', esSuperAdminMiddleware, saasController.storeCompleto);
router.post('/comercios/eliminar/:id', esSuperAdminMiddleware, saasController.deleteComercio);
router.post('/administradores/eliminar/:id', esSuperAdminMiddleware, saasController.deleteAdmin);

module.exports = router;
