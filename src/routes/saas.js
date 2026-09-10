// src/routes/saas.js
const express = require('express');
const router = express.Router();
const saasController = require('../controllers/saasController');

// Simulación de middleware en línea por si no exportas esSuperAdmin de forma global
const esSuperAdminMiddleware = (req, res, next) => {
    if (req.session.usuarioLogueado && req.session.usuarioLogueado.rol === 'superadmin') {
        return next();
    }
    // Si intenta forzar la URL un técnico o admin común, lo rebota con cartel de error
    return res.redirect('/?errorPermiso=true');
};

// Rutas de administración global protegidas
router.get('/panel', esSuperAdminMiddleware, saasController.panel);
router.post('/comercios/guardar', esSuperAdminMiddleware, saasController.store);

module.exports = router;
