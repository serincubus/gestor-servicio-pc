// src/middlewares/authMiddleware.js
const authMiddleware = {
    // 🛡️ Permite pasar a cualquier usuario logueado (Admin o Técnico)
    esStaff: (req, res, next) => {
        // Verifica si existe la sesión en cualquiera de tus formatos guardados
        if (req.session && (req.session.usuarioLogueado || req.session.esAdmin || req.session.usuario)) {
            return next();
        }
        return res.redirect('/users/login');
    },

    // 🛡️ Restringe el acceso EXCLUSIVAMENTE a Administradores (Soporta ambos formatos)
    esAdmin: (req, res, next) => {
        if (req.session) {
            // Caso A: Formato estandarizado por Rol
            if (req.session.usuarioLogueado && req.session.usuarioLogueado.rol === 'admin') {
                return next();
            }
            // Caso B: Formato viejo por booleano esAdmin directo
            if (req.session.esAdmin === true || req.session.esAdmin === 'true') {
                return next();
            }
        }
        // Si no es Admin, lo expulsa a la pantalla principal con alerta de permisos
        return res.redirect('/?errorPermiso=true');
    }
};

module.exports = authMiddleware;
