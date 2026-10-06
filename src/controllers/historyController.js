// src/controllers/historyController.js
const db = require('../database/db');

const historyController = {

    verHistorial: async (req, res) => {
        try {
            const { Ticket, Cliente } = db.models;

            const operador = req.session.usuarioLogueado;
            if (!operador) {
                return res.redirect('/users/login');
            }

            // 🛡️ FILTRO MULTITENANT: solo los tickets del comercio del operador
            // (el superadmin, si llegara acá, vería todo; pero su rol lo redirige antes)
            const whereTicket = {};
            if (operador.rol !== 'superadmin') {
                whereTicket.id_comercio = operador.id_comercio;
            }

            // 🛡️ FILTRO DEL CLIENTE: también por comercio, para no traer clientes ajenos
            const whereCliente = {};
            if (operador.rol !== 'superadmin') {
                whereCliente.id_comercio = operador.id_comercio;
            }

            // 1. Buscamos solo las órdenes del comercio logueado
            const ticketsHistoricos = await Ticket.findAll({
                where: whereTicket,
                include: [{
                    model: Cliente,
                    as: 'cliente',
                    where: Object.keys(whereCliente).length > 0 ? whereCliente : undefined,
                    required: false   // LEFT JOIN: si un ticket no tiene cliente, no lo perdemos
                }],
                order: [['createdAt', 'DESC']],
                raw: true,
                nest: true
            });

            // Nombres de los meses ordenados para formatear el índice visual
            const mesesNombre = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

            // 2. 📊 MOTOR MATEMÁTICO: Inicializamos el acumulador de caja mensual
            const acumuladoMensual = {};

            ticketsHistoricos.forEach(ticket => {
                const fecha = new Date(ticket.createdAt);
                const nombreMesAnio = `${mesesNombre[fecha.getMonth()]} ${fecha.getFullYear()}`;

                if (!acumuladoMensual[nombreMesAnio]) {
                    acumuladoMensual[nombreMesAnio] = {
                        montoTotalMensual: 0,
                        cobrado: 0,
                        pendiente: 0
                    };
                }

                const presupuesto = parseFloat(ticket.presupuesto) || 0;
                const cobrado = parseFloat(ticket.pago_parcial) || 0;
                const pendiente = presupuesto - cobrado;

                acumuladoMensual[nombreMesAnio].montoTotalMensual += presupuesto;
                acumuladoMensual[nombreMesAnio].cobrado += cobrado;
                acumuladoMensual[nombreMesAnio].pendiente += (pendiente > 0 ? pendiente : 0);
            });

            // 3. ENVIAMOS LOS DATOS PROCESADOS
            res.render('historial', {
                title: 'Historial Técnico y Reportes',
                lista: ticketsHistoricos,
                estadisticas: acumuladoMensual,
                usuarioSesion: operador
            });

        } catch (error) {
            res.send("Error crítico al procesar el reporte de caja mensual: " + error.message);
        }
    }
};

module.exports = historyController;