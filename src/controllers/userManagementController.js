// src/controllers/userManagementController.js
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

    // Registrar nuevo usuario técnico o administrador en Clever Cloud con foto
    store: async (req, res) => {
        try {
            const usuarioExistente = await Usuario.findOne({ where: { username: req.body.username.trim() } });
            if (usuarioExistente) {
                // Si el usuario existe y Multer subió una foto nueva, la borramos para no dejar basura suelta
                if (req.file) {
                    const rutaFotoSubida = path.join(__dirname, '../../public/images/users', req.file.filename);
                    if (fs.existsSync(rutaFotoSubida)) fs.unlinkSync(rutaFotoSubida);
                }

                const todos = await Usuario.findAll({ order: [['username', 'ASC']], raw: true });
                return res.render('usuariosCRUD', {
                    title: 'Gestión de Personal Técnico',
                    listaUsuarios: todos,
                    busqueda: '',
                    usuarioEditar: null,
                    error: `El nombre de usuario "${req.body.username}" ya se encuentra registrado.`
                });
            }

            // 📷 CAPTURA DE FOTO CON MULTER: Si subió archivo usa el filename, si no, usa la imagen por defecto
            let nombreImagen = 'default-user.png';
            if (req.file) {
                nombreImagen = req.file.filename;
            }

            await Usuario.create({
                username: req.body.username.trim(),
                password: req.body.password.trim(),
                rol: req.body.rol,
                foto: nombreImagen // ⬅️ Guardamos el nombre único en Clever Cloud
            });
            res.redirect('/users/management');
        } catch (error) {
            res.send("Error crítico al registrar al operador: " + error.message);
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

    // Procesar y guardar los cambios del personal (Saneado contra nulos y vacíos)
    update: async (req, res) => {
        try {
            const idUser = parseInt(req.params.id);
            const usuarioActual = await Usuario.findByPk(idUser);
            
            if (!usuarioActual) {
                return res.send("Error: No se encontró el operador en la base de datos de Clever Cloud.");
            }

            // 🛡️ SANEO ANTICAÍDAS: Si el campo no llega o viene vacío, mantenemos el valor histórico de la base de datos
            // Esto evita que el método .trim() intente leer un undefined y rompa el servidor de inmediato
            const usernameFinal = req.body.username ? req.body.username.trim() : usuarioActual.username;
            const passwordFinal = req.body.password ? req.body.password.trim() : usuarioActual.password;
            const rolFinal      = req.body.rol      ? req.body.rol            : usuarioActual.rol;

            // Mantenemos la foto actual de la base de datos por defecto
            let nombreImagen = usuarioActual.foto;

            // 📷 DETECCION DE CAMBIO DE FOTO CON MULTER
            if (req.file) {
                nombreImagen = req.file.filename;
                
                // Borramos la foto anterior del disco duro local (si no es la por defecto)
                if (usuarioActual.foto && usuarioActual.foto !== 'default-user.png') {
                    const rutaFotoVieja = path.join(__dirname, '../../public/images/users', usuarioActual.foto);
                    if (fs.existsSync(rutaFotoVieja)) {
                        fs.unlinkSync(rutaFotoVieja);
                    }
                }
            }

            // Guardamos los cambios en Clever Cloud utilizando los strings sanitizados
            await Usuario.update({
                username: usernameFinal,
                password: passwordFinal,
                rol: rolFinal,
                foto: nombreImagen
            }, {
                where: { id_usuario: idUser }
            });
            
            res.redirect('/users/management');
        } catch (error) {
            res.send("Error al actualizar la credencial del operador: " + error.message);
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
