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
        const operador = req.session.usuarioLogueado;
        const query = req.query.q ? req.query.q.trim() : ''; 

        // 1. Definimos la condición de búsqueda por texto base (Nombre del repuesto)
        let condicionesWhere = {
            componente: { [Op.like]: `%${query}%` }
        };

        // 2. 🛡️ BARRERA INVISIBLE MULTITENANT:
        // Si no es el dueño global (superadmin), lo obligamos a ver SOLO el stock de su comercio
        if (operador.rol !== 'superadmin') {
            condicionesWhere.id_comercio = operador.id_comercio;
        }

        // 3. Ejecutamos la consulta pasándole de forma directa el objeto de condiciones sanitizado
        const componentes = await Hardware.findAll({ 
            where: condicionesWhere, 
            order: [['categoria', 'ASC'], ['componente', 'ASC']], 
            raw: true 
        }); 
        
        // 4. Renderizamos la vista de stock enviando las variables de control operativas
        res.render('hardware', { 
            title: 'Catálogo de Repuestos y Componentes', 
            listaHardware: componentes, 
            busqueda: query, 
            hardwareEditar: null, // Para manejar alta y edición en la misma vista 
            usuarioSesion: operador // Inyectado para control de cabecera modular
        }); 
    } catch (error) { 
        res.send("Error al cargar el catálogo de hardware: " + error.message); 
    } 
},


    // Guardar nuevo componente + multer 
    store: async (req, res) => { 
    try { 
        // 1. Capturamos los datos de sesión del operador que está en la terminal
        const operador = req.session.usuarioLogueado;

        // ➕ CAPTURA DE MULTER: Si subió archivo usa el filename, si no, la imagen por defecto 
        let nombreImagen = 'default-hardware.png'; 
        if (req.file) { 
            nombreImagen = req.file.filename; 
        } 

        // 2. Insertamos el nuevo repuesto en la base de datos de Clever Cloud
        await Hardware.create({ 
            componente: req.body.componente.trim(), 
            categoria: req.body.categoria, 
            precio_costo: parseFloat(req.body.precio_costo) || 0, 
            precio_venta: parseFloat(req.body.precio_venta) || 0, 
            stock: parseInt(req.body.stock) || 0, 
            imagen: nombreImagen, // Guardamos el nombre único en Clever Cloud 
            // 🔒 ANCLAJE MULTITENANT: El stock se asocia de forma automática al taller activo
            id_comercio: operador.id_comercio
        }); 
        
        res.redirect('/hardware'); 
    } catch (error) { 
        res.send("Error al guardar el componente en el inventario: " + error.message); 
    } 
},

    // Cargar formulario de edición (reutiliza la misma vista) 
    edit: async (req, res) => { 
    try { 
        const operador = req.session.usuarioLogueado;
        const idHw = req.params.id;

        // 1. Buscamos el componente solicitado por su clave primaria
        const componenteAEditar = await Hardware.findByPk(idHw, { raw: true }); 
        
        // 🛡️ CONTROL DE SEGURIDAD PERIMETRAL SAAS:
        // Si el repuesto no existe o pertenece a otra sucursal, bloqueamos el acceso al instante
        if (!componenteAEditar || (operador.rol !== 'superadmin' && componenteAEditar.id_comercio !== operador.id_comercio)) {
            return res.redirect('/hardware?errorPermiso=true');
        }

        // 2. 📊 FILTRADO INVISIBLE DEL LISTADO DEL FONDO:
        // Sincronizamos la tabla del pie para que solo muestre las cosas de su propio local
        let condicionesWhere = {};
        if (operador.rol !== 'superadmin') {
            condicionesWhere.id_comercio = operador.id_comercio;
        }

        const todos = await Hardware.findAll({ 
            where: condicionesWhere,
            order: [['categoria', 'ASC'], ['componente', 'ASC']], 
            raw: true 
        }); 
        
        // 3. Renderizamos la vista de stock en modo edición
        res.render('hardware', { 
            title: 'Editar Componente de Hardware', 
            listaHardware: todos, 
            busqueda: '', 
            hardwareEditar: componenteAEditar,
            usuarioSesion: operador // Inyectado para mantener la persistencia al editar
        }); 
    } catch (error) { 
        res.send("Error al buscar el componente en el inventario: " + error.message); 
    } 
},


    // Actualizar datos del componente e imagen vieja (Versión Optimizada) 
    update: async (req, res) => { 
    try { 
        const operador = req.session.usuarioLogueado;
        const idComponente = parseInt(req.params.id); 
        
        // 1. Buscamos el registro actual en la base de datos
        const componenteActual = await Hardware.findByPk(idComponente); 
        if (!componenteActual) { 
            return res.send("Error: No se encontró el componente en el catálogo de Clever Cloud."); 
        } 
        
        // 🛡️ CONTROL DE SEGURIDAD PERIMETRAL SAAS:
        // Bloqueamos la edición si el repuesto pertenece a otra sucursal (y no eres superadmin)
        if (operador.rol !== 'superadmin' && componenteActual.id_comercio !== operador.id_comercio) {
            return res.redirect('/hardware?errorPermiso=true');
        }

        // 2. Determinamos qué imagen se va a mantener o actualizar 
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
        
        // 3. Ejecutamos la actualización en MySQL forzando la consistencia del ID de comercio
        await Hardware.update({ 
            componente: req.body.componente.trim(), 
            categoria: req.body.categoria, 
            precio_costo: parseFloat(req.body.precio_costo) || 0, 
            precio_venta: parseFloat(req.body.precio_venta) || 0, 
            stock: parseInt(req.body.stock) || 0, 
            imagen: nombreImagen,
            // Nos aseguramos de mantener el ID de comercio original del repuesto
            id_comercio: componenteActual.id_comercio
        }, { 
            where: { id_hardware: idComponente } 
        }); 
        
        // Redirección exitosa
        res.redirect('/hardware'); 
    } catch (error) { 
        res.send("Error crítico al procesar la actualización en la base de datos: " + error.message); 
    } 
},


    // Eliminar componente físico del catálogo y borrar su imagen del disco 
   delete: async (req, res) => { 
    try { 
        const operador = req.session.usuarioLogueado;
        const idComponente = req.params.id;

        // 1. Buscamos el componente solicitado por su clave primaria
        const componente = await Hardware.findByPk(idComponente); 
        
        if (componente) { 
            // 🛡️ CONTROL DE SEGURIDAD PERIMETRAL SAAS:
            // Bloqueamos la eliminación si el repuesto pertenece a otra sucursal (y no eres superadmin)
            if (operador.rol !== 'superadmin' && componente.id_comercio !== operador.id_comercio) {
                return res.redirect('/hardware?errorPermiso=true');
            }

            // Borramos el archivo de imagen de la carpeta local (si no es la por defecto) 
            if (componente.imagen && componente.imagen !== 'default-hardware.png') { 
                const rutaImagen = path.join(__dirname, '../../public/images/hardware', componente.imagen); 
                if (fs.existsSync(rutaImagen)) { 
                    fs.unlinkSync(rutaImagen); // Elimina el archivo físico del disco rígido 
                } 
            } 
            
            // 2. Eliminamos el registro de la base de datos de Clever Cloud
            await Hardware.destroy({ 
                where: { id_hardware: idComponente } 
            }); 
        } 
        
        res.redirect('/hardware'); 
    } catch (error) { 
        res.send("Error al eliminar el componente del inventario: " + error.message); 
    } 
}

}; 

hardwareController.indexController = hardwareController; 
module.exports = hardwareController;
