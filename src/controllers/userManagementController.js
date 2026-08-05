const { DataTypes, Op } = require('sequelize');
const db = require('../database/db'); 

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

    // Registrar nuevo usuario técnico o administrador
    store: async (req, res) => {
        try {
            const usuarioExistente = await Usuario.findOne({ where: { username: req.body.username.trim() } });
            if (usuarioExistente) {
                const todos = await Usuario.findAll({ order: [['username', 'ASC']], raw: true });
                return res.render('usuariosCRUD', {
                    title: 'Gestión de Personal Técnico',
                    listaUsuarios: todos,
                    busqueda: '',
                    usuarioEditar: null,
                    error: `El nombre de usuario "${req.body.username}" ya se encuentra registrado.`
                });
            }

            await Usuario.create({
                username: req.body.username.trim(),
                password: req.body.password.trim(),
                rol: req.body.rol
            });
            res.redirect('/users/management');
        } catch (error) {
            res.send("Error crítico al registrar al operador: " + error.message);
        }
    },

    // Cargar formulario en modo edición
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

    // Procesar y guardar los cambios del personal
    update: async (req, res) => {
        try {
            const idUser = parseInt(req.params.id);
            await Usuario.update({
                username: req.body.username.trim(),
                password: req.body.password.trim(),
                rol: req.body.rol
            }, {
                where: { id_usuario: idUser }
            });
            res.redirect('/users/management');
        } catch (error) {
            res.send("Error al actualizar la credencial del operador: " + error.message);
        }
    },

    // Dar de baja a un usuario de la base de datos
    delete: async (req, res) => {
        try {
            if (req.session.usuarioLogueado && req.session.usuarioLogueado.id_usuario === parseInt(req.params.id)) {
                return res.send("Acción denegada: No podés eliminar tu propia cuenta de administrador en uso.");
            }

            await Usuario.destroy({
                where: { id_usuario: req.params.id }
            });
            res.redirect('/users/management');
        } catch (error) {
            res.send("Error al dar de baja al usuario técnico: " + error.message);
        }
    }
};

module.exports = userManagementController;
