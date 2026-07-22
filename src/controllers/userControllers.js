// src/controllers/userControllers.js
const { DataTypes } = require('sequelize');
const db = require('../database/db'); 

// Inicializamos el modelo de Usuarios para consultar la base de datos
const UsuarioModel = require('../database/models/Usuario');
const Usuario = UsuarioModel(db, DataTypes);

const userControllers = {
    // Muestra el formulario de inicio de sesión
    loginVista: (req, res) => {
        res.render('login', { title: 'Acceso Técnico', error: null });
    },

    // Procesa las credenciales buscando DIRECTAMENTE en la base de datos de Clever Cloud
    procesarLogin: async (req, res) => {
        try {
            const { username, password } = req.body; // Captura el usuario y contraseña del formulario

            // 🔍 Buscamos en la base de datos si existe el nombre de usuario tipeado
            const usuarioEncontrado = await Usuario.findOne({
                where: { username: username.trim() }
            });

            // 🛑 VALIDACIÓN 1: Si el usuario no existe o la contraseña no coincide
            if (!usuarioEncontrado || usuarioEncontrado.password !== password.trim()) {
                return res.render('login', { 
                    title: 'Acceso Técnico', 
                    error: 'Nombre de usuario o contraseña incorrectos.' 
                });
            }

            // ✅ INGRESO EXITOSO: El usuario existe y su clave es correcta
            // Sincronizamos las variables de sesión dinámicamente con los datos de su fila en MySQL
            req.session.usuarioLogueado = {
                id_usuario: usuarioEncontrado.id_usuario,
                username: usuarioEncontrado.username,
                rol: usuarioEncontrado.rol // Captura automáticamente 'admin' o 'tecnico' desde la base de datos
            };

            // Mantiene compatibilidad booleana por si alguna ruta vieja todavía la usa
            req.session.esAdmin = (usuarioEncontrado.rol === 'admin');

            // Redirigimos de forma segura al panel principal
            return res.redirect('/');

        } catch (error) {
            return res.render('login', { 
                title: 'Acceso Técnico', 
                error: 'Error de conexión con la base de datos: ' + error.message 
            });
        }
    },

    // Cierra la sesión de forma segura y limpia las cookies
    logout: (req, res) => {
        req.session.destroy(() => {
            res.redirect('/users/login'); 
        });
    }
};

module.exports = userControllers;
