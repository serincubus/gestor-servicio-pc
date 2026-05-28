const { Op } = require('sequelize');
const db = require('../database/db.js');
const Cliente = require('../database/models/Cliente.js');


const indexController = {
    // Renderiza la página y muestra la lista
index: async (req, res) => {
        try {
            const clientes = await Cliente.findAll({ raw: true });;
            res.render('index', { 
                title: 'Servicio Técnico PC - Gestión', 
                lista: clientes 
            });
        } catch (error) {
            res.send("Error al cargar EJS: " + error.message);
        }
    },

    // Recibe los datos del formulario y los guarda en Clever Cloud
store: async (req, res) => {
        try {
            await Cliente.create({
                nombre: req.body.nombre,
                equipo: req.body.equipo,
                falla: req.body.falla,
                telefono: req.body.telefono 
            });
            res.redirect('/'); // Recarga la página para mostrar el nuevo cliente
        } catch (error) {
            res.send("Error al guardar cliente: " + error.message);
        }
},
    
edit: async (req, res) => {
    try {
        const cliente = await Cliente.findByPk(req.params.id_cliente);
        res.render('edit', { title: 'Editar Cliente', cliente: cliente });
    } catch (error) {
        res.send("Error: " + error.message);
    }
},

update: async (req, res) => {
    try {
        await Cliente.update({
            nombre: req.body.nombre,
            equipo: req.body.equipo,
            falla: req.body.falla,
            telefono: req.body.telefono 
        }, {
            where: { id_cliente: req.params.id_cliente }
        });
        res.redirect('/');
    } catch (error) {
        res.send("Error al actualizar: " + error.message);
    }
},

delete: async (req, res) => {
    try {
        await Cliente.destroy({
            where: { id_cliente: req.params.id_cliente }
        });
        res.redirect('/'); // Volvemos a la lista principal
    } catch (error) {
        res.send("Error al eliminar: " + error.message);
    }
},

detalle: async (req, res) => {
    try {
        const cliente = await Cliente.findByPk(req.params.id_cliente);
        res.render('detalleCliente', { title: 'Detalle del Cliente', cliente: cliente });
    } catch (error) {
        res.send("Error: " + error.message);
    }
},      

updateStatus: async (req, res) => {
    try {
        let fechaEgreso = null;
        if (req.body.estado === 'Listo') {
            fechaEgreso = new Date().toISOString().slice(0, 10); 
        }

        await Cliente.update({
            estado: req.body.estado,
            presupuesto: req.body.presupuesto,
            pago_parcial: req.body.pago_parcial, // <--- GUARDAMOS EL ADELANTO EN MYSQL
            confirmado: req.body.confirmado === 'true' || req.body.confirmado === true,
            fecha_egreso: fechaEgreso 
        }, {
            where: { id_cliente: req.params.id_cliente }
        });
        
        res.redirect('/detalle/' + req.params.id_cliente + '?actualizado=true');
    } catch (error) {
        res.send("Error al actualizar estado y pagos: " + error.message);
    }
},

history: async (req, res) => {
    try {
        const clientes = await Cliente.findAll({ raw: true });;
        res.render('historial', { 
            title: 'Historial de Clientes', 
            lista: clientes 
        });
    } catch (error) {
        res.send("Error al cargar EJS: " + error.message);
    }

},

search: async (req, res) => {
    try {
        const query = req.query.q;  

        const clientes = await Cliente.findAll({
            where: {
                nombre: {
                            [Op.like]: `%${query}%` // <-- Usar Op directamente aquí
                         }
            },
            raw: true
        });
        res.render('index', { title: 'Resultados de Búsqueda', lista: clientes });
    } catch (error) {
        res.send("Error en búsqueda: " + error.message);
    }
}
}


module.exports = indexController;
