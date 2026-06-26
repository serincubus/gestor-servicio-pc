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

     // Actualizar datos del componente e imagen vieja
    update: async (req, res) => {
        try {
            // Buscamos el registro actual para saber si ya tenía una foto asignada
            const componenteActual = await Hardware.findByPk(req.params.id);
            
            if (!componenteActual) {
                return res.send("No se encontró el componente a actualizar.");
            }

            // Determinamos qué imagen se va a guardar
            let nombreImagen = componenteActual.imagen; 

            // Si el usuario subió una nueva foto en este envío
            if (req.file) {
                nombreImagen = req.file.filename;

                // Borramos la foto anterior del servidor si no era la por defecto
                if (componenteActual.imagen && componenteActual.imagen !== 'default-hardware.png') {
                    const rutaFotoVieja = path.join(__dirname, '../../public/images/hardware', componenteActual.imagen);
                    if (fs.existsSync(rutaFotoVieja)) {
                        fs.unlinkSync(rutaFotoVieja);
                    }
                }
            }

            await Hardware.update({
                componente: req.body.componente.trim(),
                categoria: req.body.categoria,
                precio_costo: parseFloat(req.body.precio_costo),
                precio_venta: parseFloat(req.body.precio_venta),
                stock: parseInt(req.body.stock),
                imagen: nombreImagen // Guardamos el nombre actualizado
            }, {
                where: { id_hardware: req.params.id }
            });
            res.redirect('/hardware');
        } catch (error) {
            res.send("Error al actualizar el componente: " + error.message);
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
