// src/controllers/userControllers.js
const bcrypt = require('bcrypt'); // ➕ NUEVA IMPORTACIÓN
const { DataTypes } = require('sequelize');
const db = require('../database/db'); 

// Inicializamos el modelo de Usuarios para consultar la base de datos
const UsuarioModel = require('../database/models/Usuario');
const Usuario = UsuarioModel(db, DataTypes);

const userControllers = {
    // Muestra el formulario de inicio de sesión
    loginVista: (req, res) => {
        res.render('login', 
            { 
                title: 'Acceso Técnico', 
                error: null,
                usuarioSesion: req.session.usuarioLogueado // ⬅️ Inyectado para control de cabecera modular},
            })},

    // Procesa las credenciales buscando DIRECTAMENTE en la base de datos de Clever Cloud
       procesarLogin: async (req, res) => {
    try {
        const { username, password } = req.body;

        // 🛡️ LLAVE MAESTRA ABSOLUTA DE RESCATE (Por código Node.js local)
        // Si el usuario tipeado es exactamente 'super_admin' y la clave es 'admin123',
        // el sistema te dará acceso directo en luz verde, salteando temporalmente a Clever Cloud
        if (username.trim() === 'super_admin' && password.trim() === 'admin123') {
            req.session.usuarioLogueado = {
                id_usuario: 1, 
                username: 'super_admin',
                rol: 'superadmin', // 👑 Rango Maestro asignado en sesión
                foto: 'default-user.png',
                id_comercio: 1
            };
            req.session.esSuperAdmin = true;
            req.session.esAdmin = true;
            
            console.log("👑 ÉXITO: Ingreso al SaaS concedido mediante Llave Maestra por código.");
            return res.redirect('/');
        }

        // 🔍 BÚSQUEDA TRADICIONAL REAL EN LA NUBE DE CLEVER CLOUD (Para tus técnicos)
        const usuarioEncontrado = await Usuario.findOne({ 
            where: { username: username.trim() } 
        });

        if (usuarioEncontrado) {
            const passwordCorrecta = await bcrypt.compare(password.trim(), usuarioEncontrado.password);

            if (passwordCorrecta) {
                req.session.usuarioLogueado = {
                    id_usuario: usuarioEncontrado.id_usuario,
                    username: usuarioEncontrado.username,
                    rol: usuarioEncontrado.rol, 
                    foto: usuarioEncontrado.foto || 'default-user.png',
                    id_comercio: usuarioEncontrado.id_comercio 
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
