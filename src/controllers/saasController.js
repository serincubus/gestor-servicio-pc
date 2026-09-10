// src/controllers/saasController.js
const { DataTypes, Op } = require('sequelize');
const db = require('../database/db');

const ComercioModel = require('../database/models/Comercio');
const Comercio = ComercioModel(db, DataTypes);

const saasController = {
    // Listar todos los locales registrados en el sistema global
    panel: async (req, res) => {
        try {
            const query = req.query.q ? req.query.q.trim() : '';
            
            const listaComercios = await Comercio.findAll({
                where: {
                    nombre_taller: { [Op.like]: `%${query}%` }
                },
                order: [['id_comercio', 'ASC']],
                raw: true
            });

            res.render('superAdminDashboard', {
                title: 'Consola Maestra de Suscripciones',
                comercios: listaComercios,
                busqueda: query,
                usuarioSesion: req.session.usuarioLogueado
            });
        } catch (error) {
            res.send("Error en Consola Maestra: " + error.message);
        }
    },

    // Dar de alta un nuevo taller en el ecosistema SaaS
    store: async (req, res) => {
        try {
            await Comercio.create({
                nombre_taller: req.body.nombre_taller.trim(),
                telefono_contacto: req.body.telefono_contacto.trim(),
                direccion_fisica: req.body.direccion_fisica ? req.body.direccion_fisica.trim() : '',
                cuit_o_id_legal: req.body.cuit_o_id_legal ? req.body.cuit_o_id_legal.trim() : '',
                activo: true
            });
            
            res.redirect('/saas/panel');
        } catch (error) {
            res.send("Error crítico al dar de alta la suscripción: " + error.message);
        }
    }
};

module.exports = saasController;
