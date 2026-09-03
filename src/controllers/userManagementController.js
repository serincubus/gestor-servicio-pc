// src/controllers/userManagementController.js
const bcrypt = require('bcrypt');
const { DataTypes, Op } = require('sequelize');
const db = require('../database/db'); 
const path = require('path');
const fs = require('fs'); // Requerimos el módulo de sistema de archivos para borrar fotos viejas

// Inicializamos el modelo físico pasándole la conexión directa de db.js
const UsuarioModel = require('../database/models/Usuario');
const Usuario = UsuarioModel(db, DataTypes);

const userManagementController = {
    // Listar todos los técnicos registrados en el taller
    index: async (req, res) => {
        try {
            const query = req.query.q ? req.query.q.trim() : '';
            const tecnicos = await Usuario.findAll({
                where: {
                    username: { [Op.like]: `%${query}%` }
                },
                order: [['rol', 'ASC'], ['username', 'ASC']],
                raw: true
            });

            res.render('usuariosCRUD', {
                title: 'Gestión de Personal Técnico',
                listaUsuarios: tecnicos,
                busqueda: query,
                usuarioEditar: null,
                error: null
            });
        } catch (error) {
            res.send("Error al cargar el catálogo de personal: " + error.message);
        }
    },

     // Registrar nuevo usuario técnico o administrador (Versión Encriptada con Bcrypt)
    store: async (req, res) => {
        try {
            const usernameInput = req.body.username ? req.body.username.trim() : '';
            const passwordInput = req.body.password ? req.body.password.trim() : '';
            const rolInput      = req.body.rol      ? req.body.rol            : 'tecnico';

            if (!usernameInput || !passwordInput) {
                const todos = await Usuario.findAll({ order: [['username', 'ASC']], raw: true });
                return res.render('usuariosCRUD', {
                    title: 'Gestión de Personal Técnico', listaUsuarios: todos, busqueda: '', usuarioEditar: null, error: 'Error: Campos obligatorios vacíos.'
                });
            }

            const usuarioExistente = await Usuario.findOne({ where: { username: usernameInput } });
            if (usuarioExistente) {
                const todos = await Usuario.findAll({ order: [['username', 'ASC']], raw: true });
                return res.render('usuariosCRUD', {
                    title: 'Gestión de Personal Técnico', listaUsuarios: todos, busqueda: '', usuarioEditar: null, error: `El usuario "${usernameInput}" ya existe.`
                });
            }

            let nombreImagen = req.file ? req.file.filename : 'default-user.png';

            // 🔐 ENCRIPTA LA CONTRASEÑA NUEVA EN VIVO
            const passwordEncriptada = await bcrypt.hash(passwordInput, 10);

            await Usuario.create({
                username: usernameInput,
                password: passwordEncriptada, // ⬅️ Guardamos el hash seguro en Clever Cloud
                rol: rolInput,
                foto: nombreImagen 
            });
            res.redirect('/users/management');
        } catch (error) {
            res.send("Error al registrar: " + error.message);
        }
    },

    // Cargar formulario en modo edición inyectando el operador elegido
    edit: async (req, res) => {
        try {
            const usuarioAEditar = await Usuario.findByPk(req.params.id, { raw: true });
            const todos = await Usuario.findAll({ order: [['username', 'ASC']], raw: true });

            res.render('usuariosCRUD', {
                title: 'Modificar Datos de Operador',
                listaUsuarios: todos,
                busqueda: '',
                usuarioEditar: usuarioAEditar,
                error: null
            });
        } catch (error) {
            res.send("Error al buscar el perfil del operador: " + error.message);
        }
    },

     // Procesar y guardar los cambios del personal (Soporta cambios de password opcionales)
    update: async (req, res) => {
        try {
            const idUser = parseInt(req.params.id);
            const usuarioActual = await Usuario.findByPk(idUser);
            
            if (!usuarioActual) return res.send("Error: Operador no encontrado.");

            const usernameFinal = req.body.username ? req.body.username.trim() : usuarioActual.username;
            const passwordInput = req.body.password ? req.body.password.trim() : '';
            const rolFinal      = req.body.rol      ? req.body.rol            : usuarioActual.rol;
            let nombreImagen    = req.file          ? req.file.filename       : usuarioActual.foto;

            // 🔐 DETERMINAR CLAVE FINAL:
            // Si el admin escribió una clave nueva, la encriptamos. Si no, dejamos la contraseña que ya tenía.
            let passwordFinal = usuarioActual.password;
            if (passwordInput && passwordInput !== usuarioActual.password) {
                passwordFinal = await bcrypt.hash(passwordInput, 10);
            }

            await Usuario.update({
                username: usernameFinal,
                password: passwordFinal, // ⬅️ Hash actualizado
                rol: rolFinal,
                foto: nombreImagen
            }, { where: { id_usuario: idUser } });
            
            res.redirect('/users/management');
        } catch (error) {
            res.send("Error al actualizar: " + error.message);
        }
    },

    // Dar de baja a un usuario técnico de la base de datos y borrar su foto de perfil
    delete: async (req, res) => {
        try {
            if (req.session.usuarioLogueado && req.session.usuarioLogueado.id_usuario === parseInt(req.params.id)) {
                return res.send("Acción denegada: No podés eliminar tu propia cuenta de administrador en uso.");
            }

            const usuarioAEliminar = await Usuario.findByPk(req.params.id);
            if (usuarioAEliminar) {
                // Borramos su avatar físico antes de triturar el registro en Clever Cloud
                if (usuarioAEliminar.foto && usuarioAEliminar.foto !== 'default-user.png') {
                    const rutaFoto = path.join(__dirname, '../../public/images/users', usuarioAEliminar.foto);
                    if (fs.existsSync(rutaFoto)) {
                        fs.unlinkSync(rutaFoto);
                    }
                }
                
                await Usuario.destroy({
                    where: { id_usuario: req.params.id }
                });
            }
            res.redirect('/users/management');
        } catch (error) {
            res.send("Error al dar de baja al usuario técnico: " + error.message);
        }
    }
};

module.exports = userManagementController;
