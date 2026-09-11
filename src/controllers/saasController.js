// src/controllers/saasController.js
const { DataTypes, Op } = require('sequelize');
const db = require('../database/db');
const bcrypt = require('bcrypt'); // 🔐 Requerido para encriptar la cuenta del nuevo admin

const ComercioModel = require('../database/models/Comercio');
const UsuarioModel = require('../database/models/Usuario');

const Comercio = ComercioModel(db, DataTypes);
const Usuario = UsuarioModel(db, DataTypes);

const saasController = {
    // Listar comercios y administradores en la Consola Maestra
    panel: async (req, res) => {
        try {
            const query = req.query.q ? req.query.q.trim() : '';
            
            const listaComercios = await Comercio.findAll({
                where: { nombre_taller: { [Op.like]: `%${query}%` } },
                order: [['id_comercio', 'ASC']],
                raw: true
            });

            // Buscamos todos los administradores comunes de los locales
            const listaAdmins = await Usuario.findAll({
                where: { rol: 'admin' },
                order: [['id_comercio', 'ASC']],
                raw: true
            });

            res.render('superAdminDashboard', {
                title: 'Consola Maestra de Suscripciones',
                comercios: listaComercios,
                administradores: listaAdmins,
                busqueda: query,
                usuarioSesion: req.session.usuarioLogueado,
                error: null
            });
        } catch (error) {
            res.send("Error en Consola Maestra: " + error.message);
        }
    },

    // 🚀 ALTA TRANSACCIONAL UNIFICADA: Crea el taller y su respectivo administrador
    storeCompleto: async (req, res) => {
        try {
            const { nombre_taller, telefono_contacto, direccion_fisica, username, password } = req.body;

            // 1. Validamos que el nombre de usuario admin no esté duplicado globalmente
            const usuarioExistente = await Usuario.findOne({ where: { username: username.trim() } });
            if (usuarioExistente) {
                const listaComercios = await Comercio.findAll({ order: [['id_comercio', 'ASC']], raw: true });
                const listaAdmins = await Usuario.findAll({ where: { rol: 'admin' }, raw: true });
                return res.render('superAdminDashboard', {
                    title: 'Consola Maestra de Suscripciones', comercios: listaComercios, administradores: listaAdmins, busqueda: '', usuarioSesion: req.session.usuarioLogueado,
                    error: `El nombre de usuario "${username}" ya se encuentra en uso por otro técnico o administrador.`
                });
            }

            // 2. Registramos el nuevo comercio en Clever Cloud para generar su id_comercio único
            const nuevoComercio = await Comercio.create({
                nombre_taller: nombre_taller.trim(),
                telefono_contacto: telefono_contacto.trim(),
                direccion_fisica: direccion_fisica ? direccion_fisica.trim() : '',
                activo: true
            });

            // 3. 🔐 Encriptamos la clave tipeada con Bcrypt antes de guardarla
            const passwordEncriptada = await bcrypt.hash(password.trim(), 10);

            // 4. Registramos al Administrador de ese taller vinculándolo a su id_comercio nativo
            await Usuario.create({
                username: username.trim(),
                password: passwordEncriptada,
                rol: 'admin', // Rango de jerarquía de local
                foto: 'default-user.png',
                id_comercio: nuevoComercio.id_comercio // ⬅️ ANCLAJE CORPORATIVO MÓVIL
            });

            res.redirect('/saas/panel');
        } catch (error) {
            res.send("Error crítico en el alta unificada del comercio: " + error.message);
        }
    },

    // Dar de baja las credenciales de un administrador de local
    deleteAdmin: async (req, res) => {
        try {
            await Usuario.destroy({
                where: { id_usuario: req.params.id, rol: 'admin' }
            });
            res.redirect('/saas/panel');
        } catch (error) {
            res.send("Error al remover el acceso del administrador: " + error.message);
        }
    }
};

module.exports = saasController;
