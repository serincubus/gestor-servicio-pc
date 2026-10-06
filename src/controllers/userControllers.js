// src/controllers/userControllers.js
// src/controllers/userControllers.js - SANEAMIENTO DE CABECERA MULTITENANT
const bcrypt = require('bcrypt'); 

// 🛠️ IMPORTACIÓN EXTRACTORA: Traemos la conexión centralizada
const db = require('../database/db'); 

// 🔗 CORRECCIÓN CRÍTICA: Extraemos los modelos ya asociados desde el mapa exclusivo de db.js
// Esto evita instanciar modelos duplicados o huérfanos que cuelguen el inicio de sesión
const { Usuario, Comercio } = db.models;


const userControllers = {
    // Muestra el formulario de inicio de sesión
    loginVista: (req, res) => {
    res.render('login', {
        title: 'Acceso Técnico',
        error: null,
        usuarioSesion: req.session.usuarioLogueado
    });
},
    // Procesa las credenciales buscando DIRECTAMENTE en la base de datos de Clever Cloud
       procesarLogin: async (req, res) => {
        try {
            const { username, password } = req.body;

            // 🔍 1. PUENTE DE EMERGENCIA MAESTRO CON SEGURO
           if (
    username.trim() === process.env.SUPERADMIN_USER &&
    password.trim() === process.env.SUPERADMIN_PASS
) {
    req.session.usuarioLogueado = {
        id_usuario: null,
        username: process.env.SUPERADMIN_USER,
        rol: 'superadmin',
        foto: 'default-user.png',
        id_comercio: null,
        rubro: null
    };
    req.session.esSuperAdmin = true;
    req.session.esAdmin = true;
    return res.redirect('/saas/panel');
}

            // 🔍 2. BUSQUEDA RELACIONAL INDEXADA EN CLEVER CLOUD
            const usuarioEncontrado = await Usuario.findOne({ 
                where: { username: username.trim() },
                include: [{ 
                    model: Comercio, 
                    as: 'comercio' // El alias declarado en el modelo de Usuario
                }] 
            });

            if (usuarioEncontrado) {
    const passwordCorrecta = await bcrypt.compare(password.trim(), usuarioEncontrado.password);

    if (passwordCorrecta) {
        // 🛡️ Validaciones multi-tenant antes de crear la sesión
        if (!usuarioEncontrado.comercio) {
            return res.render('login', {
                title: 'Acceso Denegado',
                error: 'Tu usuario no está asociado a ningún comercio.'
            });
        }

        if (!usuarioEncontrado.comercio.activo) {
            return res.render('login', {
                title: 'Acceso Denegado',
                error: 'El comercio está dado de baja. Contactá al administrador de la plataforma.'
            });
        }

        // ✅ Sesión
        req.session.usuarioLogueado = {
            id_usuario: usuarioEncontrado.id_usuario,
            username: usuarioEncontrado.username,
            rol: usuarioEncontrado.rol,
            foto: usuarioEncontrado.foto || 'default-user.png',
            id_comercio: usuarioEncontrado.id_comercio,
            rubro: usuarioEncontrado.comercio.rubro
        };

        req.session.esSuperAdmin = (usuarioEncontrado.rol === 'superadmin');
        req.session.esAdmin = (usuarioEncontrado.rol === 'admin' || usuarioEncontrado.rol === 'superadmin');

        return res.redirect('/');
    }
}
            return res.render('login', {
                title: 'Identificación Técnica Fallida',
                error: 'Nombre de usuario o contraseña incorrectos.'
            });

        } catch (error) {
            res.send("Error crítico en el proceso de autenticación de red: " + error.message);
        }
    },




    logout: (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.send("Error al cerrar sesión: " + err.message);
            }
            res.redirect('/users/login');
        }); 
}
}


module.exports = userControllers;
