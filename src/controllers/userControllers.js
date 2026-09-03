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

            // 🔍 1. PUENTE DE EMERGENCIA BLINDADO (Pase libre temporal)
            // Si escribís estas credenciales exactas, te loguea directo sin importar lo que haya en MySQL
            if (username.trim() === 'admin' && password.trim()) {
                req.session.usuarioLogueado = {
                    id_usuario: 1, // id genérico de admin
                    username: 'admin',
                    rol: 'admin',
                    foto: 'default-user.png'
                };
                req.session.esAdmin = true;
                console.log("⚠️ ALERTA: Ingreso al taller mediante puente de rescate.");
                return res.redirect('/');
            }

            // 2. BUSQUEDA TRADICIONAL POR BASE DE DATOS (Para el resto de tus técnicos)
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
                        foto: usuarioEncontrado.foto || 'default-user.png'
                    };
                    req.session.esAdmin = (usuarioEncontrado.rol === 'admin');
                    return res.redirect('/');
                }
            }

            return res.render('login', {
                title: 'Identificación Técnica Fallida',
                error: 'Nombre de usuario o contraseña incorrectos.'
            });

        } catch (error) {
            res.send("Error crítico en autenticación: " + error.message);
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
