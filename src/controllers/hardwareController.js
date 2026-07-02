const path = require('path');
const fs=require('fs');

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

    // Guardar nuevo componente + multer
    store: async (req, res) => {
        try {
            // ➕ CAPTURA DE MULTER: Si subió archivo usa el filename, si no, la imagen por defecto
            let nombreImagen = 'default-hardware.png';
            if (req.file) {
                nombreImagen = req.file.filename;
            }

            await Hardware.create({
                componente: req.body.componente.trim(),
                categoria: req.body.categoria,
                precio_costo: parseFloat(req.body.precio_costo),
                precio_venta: parseFloat(req.body.precio_venta),
                stock: parseInt(req.body.stock),
                imagen: nombreImagen // Guardamos el nombre en Clever Cloud
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

       // Actualizar datos del componente e imagen vieja (Versión Optimizada)
    update: async (req, res) => {
        try {
            // Buscamos el registro actual asegurando que req.params.id sea un entero
            const idComponente = parseInt(req.params.id);
            const componenteActual = await Hardware.findByPk(idComponente);
            
            if (!componenteActual) {
                return res.send("Error: No se encontró el componente en el catálogo de Clever Cloud.");
            }

            // Determinamos qué imagen se va a mantener o actualizar
            let nombreImagen = componenteActual.imagen; 

            // Si el técnico adjuntó un nuevo archivo en este envío de edición
            if (req.file) {
                nombreImagen = req.file.filename;

                // Borramos la foto anterior del disco del servidor para no acumular basura
                if (componenteActual.imagen && componenteActual.imagen !== 'default-hardware.png') {
                    const rutaFotoVieja = path.join(__dirname, '../../public/images/hardware', componenteActual.imagen);
                    if (fs.existsSync(rutaFotoVieja)) {
                        fs.unlinkSync(rutaFotoVieja);
                    }
                }
            }

            // Ejecutamos la actualización en MySQL
            await Hardware.update({
                componente: req.body.componente.trim(),
                categoria: req.body.categoria,
                precio_costo: parseFloat(req.body.precio_costo),
                precio_venta: parseFloat(req.body.precio_venta),
                stock: parseInt(req.body.stock),
                imagen: nombreImagen
            }, {
                // CRÍTICO: Asegúrate de que tu modelo use exactamente 'id_hardware' como clave primaria
                where: { id_hardware: idComponente }
            });

            // Redirección exitosa (Esto generará el código 302 en tu consola)
            res.redirect('/hardware');
            
        } catch (error) {
            // Si algo falla, ahora nos mostrará un mensaje más descriptivo en el navegador
            res.send("Error crítico al procesar la actualización en la base de datos: " + error.message);
        }
    },


    // Eliminar componente físico del catálogo y borrar su imagen del disco
    delete: async (req, res) => {
        try {
            const componente = await Hardware.findByPk(req.params.id);
            
            if (componente) {
                // Borramos el archivo de imagen de la carpeta local (si no es la por defecto)
                if (componente.imagen && componente.imagen !== 'default-hardware.png') {
                    const rutaImagen = path.join(__dirname, '../../public/images/hardware', componente.imagen);
                    if (fs.existsSync(rutaImagen)) {
                        fs.unlinkSync(rutaImagen); // Elimina el archivo físico del disco rígido
                    }
                }

                // Eliminamos el registro de la base de datos
                await Hardware.destroy({
                    where: { id_hardware: req.params.id }
                });
            }
            
            res.redirect('/hardware');
        } catch (error) {
            res.send("Error al eliminar el componente: " + error.message);
        }
    }
};

hardwareController.indexController = hardwareController;
module.exports = hardwareController;
