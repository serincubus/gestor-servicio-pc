// src/middlewares/requireComercio.js
module.exports = (req, res, next) => {
    const usuario = req.session?.usuarioLogueado;

    if (!usuario) {
        return res.redirect('/users/login');
    }

    if (usuario.rol === 'superadmin') {
        return res.redirect('/saas/panel');   // ⬅️ ruta real
    }

    if (!usuario.id_comercio) {
        // Usuario sin comercio ni superadmin: sesión corrupta, cerrar
        return res.redirect('/users/login');
    }

    next();
};