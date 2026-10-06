// src/middlewares/authMiddleware.js
const authMiddleware = {

    // 🛡️ Cualquier usuario logueado (admin, técnico o superadmin)
    esStaff: (req, res, next) => {
        const usuario = req.session?.usuarioLogueado;
        if (!usuario) {
            return res.redirect('/users/login');
        }
        return next();
    },

    // 🛡️ Solo admin del comercio o superadmin
    esAdmin: (req, res, next) => {
        const usuario = req.session?.usuarioLogueado;
        if (!usuario) {
            return res.redirect('/users/login');
        }
        if (!['admin', 'superadmin'].includes(usuario.rol)) {
            return res.status(403).send("Acceso denegado: se requiere rango de administrador.");
        }
        return next();
    },

    // 🛡️ Solo superadmin (para el panel de plataforma)
    esSuperAdmin: (req, res, next) => {
        const usuario = req.session?.usuarioLogueado;
        if (!usuario) {
            return res.redirect('/users/login');
        }
        if (usuario.rol !== 'superadmin') {
            return res.status(403).send("Acceso denegado: solo super administradores.");
        }
        return next();
    }
};

module.exports = authMiddleware;