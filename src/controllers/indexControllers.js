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
        const clientes = await Cliente.findAll({ raw: true });
        
        // MÓDULO ESTADÍSTICO: Procesamiento de sumas en el servidor
        let estadisticasMensuales = {};
        
        clientes.forEach(cliente => {
            let fecha = new Date(cliente.createdAt);
            let mesAnio = fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
            mesAnio = mesAnio.charAt(0).toUpperCase() + mesAnio.slice(1);

            let totalPresupuesto = Number(cliente.presupuesto || 0);
            let totalCobrado = Number(cliente.pago_parcial || 0);
            let totalPendiente = totalPresupuesto - totalCobrado;

            if (!estadisticasMensuales[mesAnio]) {
                estadisticasMensuales[mesAnio] = { cobrado: 0, pendiente: 0, montoTotalMensual: 0 };
            }

            estadisticasMensuales[mesAnio].cobrado += totalCobrado;
            estadisticasMensuales[mesAnio].montoTotalMensual += totalPresupuesto;
            if (totalPendiente > 0) {
                estadisticasMensuales[mesAnio].pendiente += totalPendiente;
            }
        });

        // Enviamos a la vista tanto la lista como el objeto de estadísticas ya resuelto
        res.render('historial', { 
            title: 'Historial de Clientes', 
            lista: clientes,
            estadisticas: estadisticasMensuales // <-- Variable nueva para EJS
        });
    } catch (error) {
        res.send("Error al cargar el historial en servidor: " + error.message);
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
