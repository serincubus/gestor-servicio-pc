
module.exports = (req, res, next) => {
    const usuario = req.session.usuarioLogueado;

    if (!usuario) {
        return res.redirect('/users/login');
    }

    if (usuario.rol === 'superadmin' || !usuario.id_comercio) {
        return res.redirect('/superadmin');   // el superadmin va a su panel
    }

    next();
};