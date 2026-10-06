// src/controllers/indexControllers.js
const { Op } = require('sequelize');
const db = require('../database/db');
const { Cliente, Ticket, Comercio, Hardware } = db.models;
const diccionarioRubros = require('../utils/diccionarioRubros');

// 🧠 Helper: obtiene las etiquetas del rubro activo del operador
function getLabels(req) {
    const rubro = req.session?.usuarioLogueado?.rubro || 'tecnico_pc';
    return diccionarioRubros[rubro] || diccionarioRubros.tecnico_pc;
}

// 🛡️ Helper: arma el where de comercio según el rol
function filtroComercio(operador, campo = 'id_comercio') {
    if (!operador || operador.rol === 'superadmin') return {};
    return { [campo]: operador.id_comercio };
}

const indexController = {

    // 1. Panel principal con la lista de tickets
    index: async (req, res) => {
        try {
            const operador = req.session.usuarioLogueado;
            if (!operador) return res.redirect('/users/login');

            const labels = getLabels(req);
            const query = req.query.q ? req.query.q.trim() : '';

            // 🛡️ Filtro multi-tenant base
            const condicionesTicket = { ...filtroComercio(operador) };

            // 🔍 Búsqueda por nombre de cliente
            const condicionesCliente = {};
            if (query !== '') {
                condicionesCliente.nombre = { [Op.like]: `%${query}%` };
            }

            const reparacionesFiltradas = await Ticket.findAll({
                where: condicionesTicket,
                include: [{
                    model: Cliente,
                    as: 'cliente',
                    where: Object.keys(condicionesCliente).length > 0 ? condicionesCliente : undefined,
                    required: query !== ''
                }],
                order: [['createdAt', 'DESC']],
                raw: true,
                nest: true
            });

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 Tickets traídos:', reparacionesFiltradas.length);
console.log('🔍 IDs:', reparacionesFiltradas.map(t => t.id_ticket));
console.log('🔍 Códigos:', reparacionesFiltradas.map(t => t.codigo_seguimiento));
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            res.render('index', {
                title: 'Panel Operativo',
                lista: reparacionesFiltradas,
                busqueda: query,
                usuarioSesion: operador,
                labels
            });

        } catch (error) {
            res.send("Error crítico al procesar el listado: " + error.message);
        }
    },

    // 2. Alta de ticket + cliente (con findOrCreate aislado por comercio)
    store: async (req, res) => {
        try {
            const operador = req.session.usuarioLogueado;
            if (!operador) return res.redirect('/users/login');

            const idComercio = operador.id_comercio;
            const idClienteExistente = req.body.id_cliente ? parseInt(req.body.id_cliente) : null;
            let idClienteFinal;

            if (idClienteExistente) {
                // Validamos que el cliente pertenezca al comercio del operador
                const clienteExistente = await Cliente.findOne({
                    where: { id_cliente: idClienteExistente, id_comercio: idComercio }
                });
                if (!clienteExistente) {
                    return res.status(403).send("El cliente no pertenece a tu comercio.");
                }
                idClienteFinal = clienteExistente.id_cliente;
            } else {
                // 🔒 findOrCreate aislado por comercio
                const [clienteEncontrado] = await Cliente.findOrCreate({
                    where: {
                        telefono: req.body.telefono.trim(),
                        id_comercio: idComercio          // ⬅️ clave
                    },
                    defaults: {
                        nombre: req.body.nombre.trim(),
                        telefono: req.body.telefono.trim(),
                        id_comercio: idComercio          // ⬅️ clave
                    }
                });
                idClienteFinal = clienteEncontrado.id_cliente;
            }

            const numeroTicket = 'TICKET-' + Math.random().toString(36).substring(2, 8).toUpperCase();

            await Ticket.create({
                id_cliente: idClienteFinal,
                codigo_seguimiento: numeroTicket,
                equipo: req.body.equipo.trim(),
                falla: req.body.falla.trim(),
                estado: 'Ingresado',
                presupuesto: 0.00,
                pago_parcial: 0.00,
                id_comercio: idComercio
            });

            res.redirect('/');
        } catch (error) {
            res.send("Error crítico al guardar ticket: " + error.message);
        }
    },

    // 3. Búsqueda por nombre de cliente
    search: async (req, res) => {
        try {
            const operador = req.session.usuarioLogueado;
            if (!operador) return res.redirect('/users/login');

            const labels = getLabels(req);
            const query = req.query.q ? req.query.q.trim() : '';

            const condicionesTicket = { ...filtroComercio(operador) };
            const condicionesCliente = {
                nombre: { [Op.like]: `%${query}%` }
            };

            const ticketsFiltrados = await Ticket.findAll({
                where: condicionesTicket,
                include: [{
                    model: Cliente,
                    as: 'cliente',
                    where: condicionesCliente,
                    required: true
                }],
                raw: true,
                nest: true
            });

            res.render('index', {
                title: `Resultados: "${query}"`,
                lista: ticketsFiltrados,
                busqueda: query,
                usuarioSesion: operador,
                labels
            });
        } catch (error) {
            res.send("Error en la búsqueda: " + error.message);
        }
    },

    // 4. Formulario de edición
    edit: async (req, res) => {
        try {
            const operador = req.session.usuarioLogueado;
            if (!operador) return res.redirect('/users/login');

            const labels = getLabels(req);
            const idParam = req.params.id_cliente;

            let ticket = await Ticket.findOne({
                where: {
                    id_ticket: idParam,
                    ...filtroComercio(operador)
                },
                include: [{ model: Cliente, as: 'cliente' }],
                nest: true
            });

            if (!ticket) {
                ticket = await Ticket.findOne({
                    where: {
                        id_cliente: idParam,
                        ...filtroComercio(operador)
                    },
                    include: [{ model: Cliente, as: 'cliente' }],
                    nest: true
                });
            }

            if (!ticket || !ticket.cliente) {
                return res.status(404).send(`El ticket con id ${idParam} no existe o no pertenece a tu comercio.`);
            }

            const clienteMapeado = {
                id_ticket: ticket.id_ticket,
                id_cliente: ticket.cliente.id_cliente,
                nombre: ticket.cliente.nombre,
                telefono: ticket.cliente.telefono,
                equipo: ticket.equipo,
                falla: ticket.falla
            };

            res.render('edit', {
                title: 'Editar Registro',
                cliente: clienteMapeado,
                usuarioSesion: operador,
                labels
            });
        } catch (error) {
            res.send("Error al cargar formulario de edición: " + error.message);
        }
    },

    // 5. Guardar cambios del formulario de edición
    update: async (req, res) => {
        try {
            const operador = req.session.usuarioLogueado;
            if (!operador) return res.redirect('/users/login');

            const ticket = await Ticket.findOne({
                where: {
                    id_ticket: req.params.id_cliente,
                    ...filtroComercio(operador)
                }
            });

            if (!ticket) {
                return res.status(404).send("Ticket no encontrado o no pertenece a tu comercio.");
            }

            // Actualizamos cliente (solo si pertenece al comercio)
            await Cliente.update({
                nombre: req.body.nombre.trim(),
                telefono: req.body.telefono.trim()
            }, {
                where: {
                    id_cliente: ticket.id_cliente,
                    ...filtroComercio(operador)
                }
            });

            // Actualizamos ticket
            await Ticket.update({
                equipo: req.body.equipo.trim(),
                falla: req.body.falla
            }, {
                where: {
                    id_ticket: req.params.id_cliente,
                    ...filtroComercio(operador)
                }
            });

            res.redirect('/');
        } catch (error) {
            res.send("Error al guardar cambios: " + error.message);
        }
    },

    // 6. Eliminar ticket
    delete: async (req, res) => {
        try {
            const operador = req.session.usuarioLogueado;
            if (!operador) return res.redirect('/users/login');

            await Ticket.destroy({
                where: {
                    id_ticket: req.params.id_cliente,
                    ...filtroComercio(operador)
                }
            });

            res.redirect('/');
        } catch (error) {
            res.send("Error al eliminar el ticket: " + error.message);
        }
    },

    // 7. Detalle del ticket (con hardware del comercio)
    detalle: async (req, res) => {
        try {
            const operador = req.session.usuarioLogueado;
            if (!operador) return res.redirect('/users/login');

            const labels = getLabels(req);
            const idParam = req.params.id_cliente;

            let ticket = await Ticket.findOne({
                where: {
                    id_ticket: idParam,
                    ...filtroComercio(operador)
                },
                include: [{ model: Cliente, as: 'cliente' }],
                nest: true
            });

            if (!ticket) {
                ticket = await Ticket.findOne({
                    where: {
                        id_cliente: idParam,
                        ...filtroComercio(operador)
                    },
                    include: [{ model: Cliente, as: 'cliente' }],
                    nest: true
                });
            }

            if (!ticket || !ticket.cliente) {
                return res.status(404).send("El ticket no existe o no pertenece a tu comercio.");
            }

            const repuestosDisponibles = await Hardware.findAll({
                where: filtroComercio(operador),
                order: [['categoria', 'ASC'], ['componente', 'ASC']],
                raw: true
            });

            let componentesGuardados = [];
            try {
                componentesGuardados = JSON.parse(ticket.componentes_json || '[]');
            } catch (e) {
                componentesGuardados = [];
            }

            const mapeoClienteCompatibilidad = {
                id_ticket: ticket.id_ticket,
                id_cliente: ticket.cliente.id_cliente,   // ⬅️ fix: era ticket.id_ticket
                nombre: ticket.cliente.nombre,
                telefono: ticket.cliente.telefono,
                equipo: ticket.equipo,
                falla: ticket.falla,
                estado: ticket.estado,
                presupuesto: ticket.presupuesto,
                pago_parcial: ticket.pago_parcial,
                confirmado: ticket.confirmado,
                codigo_seguimiento: ticket.codigo_seguimiento,
                createdAt: ticket.createdAt,
                mano_obra: ticket.mano_obra || 0
            };

            res.render('detalleCliente', {
                title: 'Detalle del Ticket',
                cliente: mapeoClienteCompatibilidad,
                listaHardware: repuestosDisponibles,
                componentesGuardados,
                usuarioSesion: operador,
                labels
            });
        } catch (error) {
            res.send("Error al cargar detalle: " + error.message);
        }
    },

    // 8. Actualizar estado + stock (con validación de rubro y reversión por cierre alternativo)
    updateStatus: async (req, res) => {
        const transaction = await db.transaction();
        try {
            const operador = req.session.usuarioLogueado;
            if (!operador) return res.redirect('/users/login');

            const labels = getLabels(req);
            const estadoNuevo = req.body.estado;

            // 🛡️ Validación: el estado debe existir en el diccionario del rubro
            const cfgEstado = labels.estados?.[estadoNuevo];
            if (!cfgEstado) {
                await transaction.rollback();
                return res.status(400).send(`Estado inválido "${estadoNuevo}" para el rubro ${operador.rubro}.`);
            }

            // 🛡️ Buscamos el ticket aplicando filtro de comercio
            const ticketPrevio = await Ticket.findOne({
                where: {
                    id_ticket: req.params.id_cliente,
                    ...filtroComercio(operador)
                },
                transaction
            });

            if (!ticketPrevio) {
                await transaction.rollback();
                return res.status(404).send("Ticket no encontrado o no pertenece a tu comercio.");
            }

            // Parseamos componentes previos y nuevos
            let componentesViejos = [];
            try { componentesViejos = JSON.parse(ticketPrevio.componentes_json || '[]'); } catch (e) {}

            let listaComponentesInput = req.body.componentes_array_json || '[]';
            let componentesNuevos = [];
            try { componentesNuevos = JSON.parse(listaComponentesInput); } catch (e) {}

            // Si es un cierre alternativo, limpiamos componentes y revertimos stock
            const esCierreAlternativo = cfgEstado.tipo === 'cierre';
            if (esCierreAlternativo) {
                listaComponentesInput = '[]';
                componentesNuevos = [];
            }

            // Sanitización de importes
            const presupuestoFinal = parseFloat(req.body.presupuesto) || 0;
            const manoObraFinal = parseFloat(req.body.mano_obra) || 0;
            let pagoParcialFinal = parseFloat(req.body.pago_parcial) || 0;
            if (pagoParcialFinal < 0) pagoParcialFinal = 0;

            // Fecha de egreso: al cerrar (éxito o cierre alternativo)
            const fechaEgreso = (cfgEstado.tipo === 'exito' || cfgEstado.tipo === 'cierre')
                ? new Date().toISOString().slice(0, 10)
                : null;

            // 🔍 Mapeo de variaciones de stock por nombre de componente
            const conteoViejos = {};
            componentesViejos.forEach(item => {
                const nombre = item.nombre || item.componente;
                if (nombre) conteoViejos[nombre] = (conteoViejos[nombre] || 0) + 1;
            });

            const conteoNuevos = {};
            componentesNuevos.forEach(item => {
                const nombre = item.nombre || item.componente;
                if (nombre) conteoNuevos[nombre] = (conteoNuevos[nombre] || 0) + 1;
            });

            const todosLosItems = new Set([...Object.keys(conteoViejos), ...Object.keys(conteoNuevos)]);

            for (let nombreArticulo of todosLosItems) {
                const cantidadVieja = conteoViejos[nombreArticulo] || 0;
                const cantidadNueva = conteoNuevos[nombreArticulo] || 0;
                const diferencia = cantidadNueva - cantidadVieja;

                if (diferencia !== 0) {
                    const articuloStock = await Hardware.findOne({
                        where: {
                            componente: nombreArticulo,
                            ...filtroComercio(operador)      // ⬅️ nunca tocar stock ajeno
                        },
                        transaction
                    });

                    if (articuloStock) {
                        let nuevoStock = articuloStock.stock - diferencia;
                        if (nuevoStock < 0) nuevoStock = 0;

                        await Hardware.update(
                            { stock: nuevoStock },
                            { where: { id_hardware: articuloStock.id_hardware }, transaction }
                        );
                    }
                }
            }

            await Ticket.update({
                estado: estadoNuevo,
                presupuesto: presupuestoFinal,
                pago_parcial: pagoParcialFinal,
                confirmado: req.body.checkbox_confirmado === 'true' || req.body.checkbox_confirmado === 'on',
                fecha_egreso: fechaEgreso,
                componentes_json: listaComponentesInput,
                mano_obra: manoObraFinal
            }, {
                where: {
                    id_ticket: req.params.id_cliente,
                    ...filtroComercio(operador)
                },
                transaction
            });

            await transaction.commit();
            res.redirect(`/detalle/${req.params.id_cliente}?actualizado=true`);

        } catch (error) {
            if (transaction) await transaction.rollback();
            res.send("Error crítico al actualizar el ticket: " + error.message);
        }
    },

    // 9. Historial de caja mensual
    history: async (req, res) => {
        try {
            const operador = req.session.usuarioLogueado;
            if (!operador) return res.redirect('/users/login');

            const labels = getLabels(req);

            const todosLosTickets = await Ticket.findAll({
                where: filtroComercio(operador),           // ⬅️ filtro clave
                include: [{ model: Cliente, as: 'cliente' }],
                raw: true,
                nest: true
            });

            // Clasificamos por tipo de estado para separar facturables de cierres alternativos
            let totalPerdido = 0;

            const listaMapeada = todosLosTickets.map(t => {
                const cfg = labels.estados?.[t.estado] || { tipo: 'proceso', label: t.estado };
                return {
                    createdAt: t.createdAt,
                    nombre: t.cliente?.nombre || '—',
                    equipo: t.equipo,
                    falla: t.falla,
                    fecha_egreso: t.fecha_egreso,
                    presupuesto: t.presupuesto,
                    pago_parcial: t.pago_parcial,
                    confirmado: t.confirmado,
                    estado: t.estado,
                    estadoLabel: cfg.label,
                    tipo: cfg.tipo
                };
            });

            const estadisticasMensuales = {};
            listaMapeada.forEach(item => {
                const fecha = new Date(item.createdAt);
                let mesAnio = fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
                mesAnio = mesAnio.charAt(0).toUpperCase() + mesAnio.slice(1);

                if (!estadisticasMensuales[mesAnio]) {
                    estadisticasMensuales[mesAnio] = { cobrado: 0, pendiente: 0, montoTotalMensual: 0, perdido: 0 };
                }

                const presupuesto = Number(item.presupuesto || 0);
                const cobrado = Number(item.pago_parcial || 0);
                const pendiente = presupuesto - cobrado;

                if (item.tipo === 'cierre') {
                    // Los cierres alternativos no se facturan: sumamos a "perdido"
                    estadisticasMensuales[mesAnio].perdido += presupuesto;
                } else {
                    estadisticasMensuales[mesAnio].cobrado += cobrado;
                    estadisticasMensuales[mesAnio].montoTotalMensual += presupuesto;
                    if (pendiente > 0) {
                        estadisticasMensuales[mesAnio].pendiente += pendiente;
                    }
                }
            });

            res.render('historial', {
                title: 'Historial de Clientes',
                lista: listaMapeada,
                estadisticas: estadisticasMensuales,
                usuarioSesion: operador,
                labels
            });
        } catch (error) {
            res.send("Error en el historial: " + error.message);
        }
    },

    // 10. Vista pública de consulta (sin login)
    consultaReparacion: (req, res) => {
        res.render('consultaPublica', {
            title: 'Consulta de Reparación',
            cliente: null,
            error: null
        });
    },

    // 11. Búsqueda pública por código de seguimiento (sin login)
    buscarEstadoCliente: async (req, res) => {
        try {
            const ticketIngresado = req.body.codigo.toUpperCase().trim();

            const ticket = await Ticket.findOne({
                where: { codigo_seguimiento: ticketIngresado },
                include: [{ model: Cliente, as: 'cliente' }],
                nest: true
            });

            if (!ticket) {
                return res.render('consultaPublica', {
                    title: 'Consulta de Reparación',
                    cliente: null,
                    error: 'El número de ticket ingresado no existe.'
                });
            }

            // Necesitamos el diccionario del comercio del ticket
            const comercio = await Comercio.findByPk(ticket.id_comercio, { raw: true });
            const labels = diccionarioRubros[comercio?.rubro] || diccionarioRubros.tecnico_pc;

            const mapeoPublico = {
                codigo_seguimiento: ticket.codigo_seguimiento,
                estado: ticket.estado,
                estadoLabel: labels.estados?.[ticket.estado]?.label || ticket.estado,
                nombre: ticket.cliente.nombre,
                equipo: ticket.equipo,
                falla: ticket.falla,
                presupuesto: ticket.presupuesto,
                pago_parcial: ticket.pago_parcial,
                confirmado: ticket.confirmado
            };

            res.render('consultaPublica', {
                title: 'Consulta de Reparación',
                cliente: mapeoPublico,
                error: null
            });
        } catch (error) {
            res.send("Error al consultar ticket público: " + error.message);
        }
    }
};

module.exports = indexController;