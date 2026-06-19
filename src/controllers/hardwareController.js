// src/controllers/hardwareController.js (Líneas iniciales corregidas al 100%)
const { Op, DataTypes } = require('sequelize');

// 1. Importamos la conexión real desde tu archivo db.js
const db = require('../database/db'); 

// 2. Inicializamos el modelo Hardware pasándole obligatoriamente la variable "db"
const HardwareModel = require('../database/models/Hardware');
const Hardware = HardwareModel(db, DataTypes); 

const hardwareController = {
    // Listar todos los componentes y permitir búsquedas
    index: async (req, res) => {
        try {
            const query = req.query.q ? req.query.q.trim() : '';
            const componentes = await Hardware.findAll({
                where: {
                    componente: { [Op.like]: `%${query}%` }
                },
                order: [['categoria', 'ASC'], ['componente', 'ASC']],
                raw: true
            });

            res.render('hardware', {
                title: 'Catálogo de Hardware y Repuestos',
                listaHardware: componentes,
                busqueda: query,
                hardwareEditar: null // Para manejar alta y edición en la misma vista
            });
        } catch (error) {
            res.send("Error al cargar el catálogo de hardware: " + error.message);
        }
    },

    // Guardar nuevo componente
    store: async (req, res) => {
        try {
            await Hardware.create({
                componente: req.body.componente.trim(),
                categoria: req.body.categoria,
                precio_costo: parseFloat(req.body.precio_costo),
                precio_venta: parseFloat(req.body.precio_venta),
                stock: parseInt(req.body.stock)
            });
            res.redirect('/hardware');
        } catch (error) {
            res.send("Error al guardar el componente: " + error.message);
        }
    },

    // Cargar formulario de edición (reutiliza la misma vista)
    edit: async (req, res) => {
        try {
            const componenteAEditar = await Hardware.findByPk(req.params.id, { raw: true });
            const todos = await Hardware.findAll({ order: [['categoria', 'ASC']], raw: true });

            res.render('hardware', {
                title: 'Editar Componente de Hardware',
                listaHardware: todos,
                busqueda: '',
                hardwareEditar: componenteAEditar
            });
        } catch (error) {
            res.send("Error al buscar el componente: " + error.message);
        }
    },

    // Actualizar datos del componente
    update: async (req, res) => {
        try {
            await Hardware.update({
                componente: req.body.componente.trim(),
                categoria: req.body.categoria,
                precio_costo: parseFloat(req.body.precio_costo),
                precio_venta: parseFloat(req.body.precio_venta),
                stock: parseInt(req.body.stock)
            }, {
                where: { id_hardware: req.params.id }
            });
            res.redirect('/hardware');
        } catch (error) {
            res.send("Error al actualizar el componente: " + error.message);
        }
    },

    // Eliminar componente físico del catálogo
    delete: async (req, res) => {
        try {
            await Hardware.destroy({
                where: { id_hardware: req.params.id }
            });
            res.redirect('/hardware');
        } catch (error) {
            res.send("Error al eliminar el componente: " + error.message);
        }
    }
};

hardwareController.indexController = hardwareController;
module.exports = hardwareController;
