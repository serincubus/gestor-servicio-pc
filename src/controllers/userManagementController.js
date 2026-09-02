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

    // Registrar nuevo usuario técnico o administrador en Clever Cloud con foto (Saneado)
    store: async (req, res) => {
        try {
            // 🛡️ SANEO ANTICAÍDAS: Validamos que los campos existan antes de aplicar .trim()
            // Si el name del input llega vacío o incorrecto, le asignamos un string vacío para que no rompa Node
            const usernameInput = req.body.username ? req.body.username.trim() : '';
            const passwordInput = req.body.password ? req.body.password.trim() : '';
            const rolInput      = req.body.rol      ? req.body.rol            : 'tecnico';

            // Si los campos obligatorios están completamente vacíos, rechazamos de inmediato
            if (!usernameInput || !passwordInput) {
                // Si Multer subió una foto en este intento fallido, la eliminamos para no acumular basura
                if (req.file) {
                    const rutaBasura = path.join(__dirname, '../../public/images/users', req.file.filename);
                    if (fs.existsSync(rutaBasura)) fs.unlinkSync(rutaBasura);
                }
                const todos = await Usuario.findAll({ order: [['username', 'ASC']], raw: true });
                return res.render('usuariosCRUD', {
                    title: 'Gestión de Personal Técnico',
                    listaUsuarios: todos,
                    busqueda: '',
                    usuarioEditar: null,
                    error: 'Error: El nombre de usuario y la contraseña son campos obligatorios.'
                });
            }

            // Validación de unicidad de nombre de usuario en MySQL de Clever Cloud
            const usuarioExistente = await Usuario.findOne({ where: { username: usernameInput } });
            if (usuarioExistente) {
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
                    error: `El nombre de usuario "${usernameInput}" ya se encuentra registrado.`
                });
            }

            // 📷 CAPTURA DE FOTO CON MULTER: Si subió archivo usa el filename, si no, usa la de respaldo
            let nombreImagen = 'default-user.png';
            if (req.file) {
                nombreImagen = req.file.filename;
            }

            // Guardamos el nuevo operador en la base de datos de producción
            await Usuario.create({
                username: usernameInput,
                password: passwordInput,
                rol: rolInput,
                foto: nombreImagen 
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
