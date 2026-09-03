

const historyController = {

    verHistorial: async (req, res) => {
    try {
        const db = require('../database/db');
        const Ticket = db.models.Ticket;
        const Cliente = db.models.Cliente;

        // 1. Buscamos todas las órdenes históricas guardadas en Clever Cloud
        const ticketsHistoricos = await Ticket.findAll({
            include: [{ model: Cliente, as: 'cliente' }],
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
            // Creamos una clave única por mes y año (ej: "Septiembre 2026")
            const nombreMesAnio = `${mesesNombre[fecha.getMonth()]} ${fecha.getFullYear()}`;

            // Si el mes no existe en el acumulador, creamos su ficha base con importes en 0
            if (!acumuladoMensual[nombreMesAnio]) {
                acumuladoMensual[nombreMesAnio] = {
                    montoTotalMensual: 0,
                    cobrado: 0,
                    pendiente: 0
                };
            }

            // Mapeamos los importes numéricos sanitizados del ticket
            const presupuesto = parseFloat(ticket.presupuesto) || 0;
            const cobrado = parseFloat(ticket.pago_parcial) || 0;
            const pendiente = presupuesto - cobrado;

            // Sumamos los importes en cascada dentro del casillero mensual correspondiente
            acumuladoMensual[nombreMesAnio].montoTotalMensual += presupuesto;
            acumuladoMensual[nombreMesAnio].cobrado += cobrado;
            acumuladoMensual[nombreMesAnio].pendiente += (pendiente > 0 ? pendiente : 0);
        });

        // 3. ENVIAMOS LOS DATOS PROCESADOS: La vista recibe el JSON limpio y directo
        res.render('historial', {
            title: 'Historial Técnico y Reportes',
            lista: ticketsHistoricos,
            estadisticas: acumuladoMensual, // ⬅️ Viaja el cálculo matemático resuelto al instante
            usuarioSesion: req.session.usuarioLogueado
        });

    } catch (error) {
        res.send("Error crítico al procesar el reporte de caja mensual: " + error.message);
    }
}
}

module.exports = historyController;