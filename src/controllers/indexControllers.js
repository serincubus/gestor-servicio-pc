// src/controllers/indexControllers.js
const { Op } = require('sequelize');
const { Cliente, Ticket} = require('../database/models/asociaciones'); // Importamos ambos modelos con sus asociaciones

const indexController = {
    // 1. Muestra todos los tickets activos en el taller con los datos de sus dueños
        // 1. Muestra todos los tickets activos ordenados en la pantalla de inicio
    index: async (req, res) => {
        try {
            // Buscamos los modelos dinámicos desde la base de datos de Sequelize
            const db = require('../database/db');
            const Ticket = db.models.Ticket;
            const Cliente = db.models.Cliente;

            const ticketsTaller = await Ticket.findAll({
                include: [{ model: Cliente, as: 'cliente' }], 
                order: [['id_ticket', 'DESC']], 
                raw: true,
                nest: true 
            });
            
            // RENDEREADO CORREGIDO: Enviamos las credenciales del usuario activo al index
            res.render('index', { 
                title: 'Servicio Técnico PC - Gestión', 
                lista: ticketsTaller,
                usuarioSesion: req.session.usuarioLogueado // ⬅️ ¡ESTA LÍNEA CARGA AL USUARIO LOGUEADO!
            });
        } catch (error) {
            res.send("Error al cargar la pantalla de inicio: " + error.message);
        }
    },


    // 2. Guarda el ticket y asocia inteligentemente al cliente (Nuevo o Existente)
    store: async (req, res) => {
        try {
            // Buscamos si el cliente ya existe por teléfono, si no, lo creamos
            const [clienteEncontrado, creado] = await Cliente.findOrCreate({
                where: { telefono: req.body.telefono.trim() },
                defaults: {
                    nombre: req.body.nombre.trim(),
                    telefono: req.body.telefono.trim()
                }
            });

            // Generamos un número de ticket aleatorio único
            const numeroTicket = 'TICKET-' + Math.random().toString(36).substring(2, 8).toUpperCase();

            // Creamos el ticket apuntando al id_cliente correspondiente
            await Ticket.create({
                id_cliente: clienteEncontrado.id_cliente, // Clave foránea
                codigo_seguimiento: numeroTicket,
                equipo: req.body.equipo,
                falla: req.body.falla
            });

            res.redirect('/'); 
        } catch (error) {
            res.send("Error al guardar cliente y ticket: " + error.message);
        }
    },

    // NUEVO: Lógica de búsqueda en Backend con relaciones
    search: async (req, res) => {
        try {
            const query = req.query.q ? req.query.q.trim() : '';  

            // Buscamos en la tabla de Tickets pero filtrando por el nombre del Cliente asociado
            const ticketsFiltrados = await Ticket.findAll({
                include: [{
                    model: Cliente,
                    as: 'cliente',
                    where: {
                        nombre: {
                            [Op.like]: `%${query}%` // SQL: WHERE nombre LIKE '%query%'
                        }
                    }
                }],
                raw: true,
                nest: true
            });

            // Renderizamos la misma vista 'index' pero pasándole solo los resultados encontrados
            res.render('index', { 
                title: `Resultados de búsqueda: "${query}"`, 
                lista: ticketsFiltrados,
                usuarioSesion: req.session.usuarioLogueado // ⬅️ ¡ESTA LÍNEA HACE QUE EL BOTÓN APAREZCA! 
            });
        } catch (error) {
            res.send("Error en la búsqueda del servidor: " + error.message);
        }
    },

        // Renderiza el formulario cargando los datos cruzados de ambas tablas
    edit: async (req, res) => {
        try {
            // Buscamos el ticket por su ID e incluimos el cliente dueño
            const ticket = await Ticket.findByPk(req.params.id_cliente, {
                include: [{ model: Cliente, as: 'cliente' }],
                nest: true
            });

            if (!ticket) {
                return res.send("El ticket de reparación no existe.");
            }
            
            // Creamos un objeto plano compatible con tu vista actual edit.ejs
            const clienteMapeado = {
                id_cliente: ticket.id_ticket, // Mantiene la referencia para la URL del formulario
                nombre: ticket.cliente.nombre,
                telefono: ticket.cliente.telefono,
                equipo: ticket.equipo,
                falla: ticket.falla
            };

            res.render('edit', { title: 'Editar Registro', cliente: clienteMapeado });
        } catch (error) {
            res.send("Error al cargar el formulario de edición: " + error.message);
        }
    },

    // Procesa y guarda los cambios en ambas tablas por separado
    update: async (req, res) => {
        try {
            // 1. Buscamos el ticket para conocer el id_cliente original en MySQL
            const ticket = await Ticket.findByPk(req.params.id_cliente);

            if (!ticket) {
                return res.send("No se encontró el registro para actualizar.");
            }

            // 2. Actualizamos la tabla de CLIENTES (Nombre y Teléfono)
            await Cliente.update({
                nombre: req.body.nombre.trim(),
                telefono: req.body.telefono.trim()
            }, {
                where: { id_cliente: ticket.id_cliente }
            });

            // 3. Actualizamos la tabla de TICKETS (Equipo y Falla)
            await Ticket.update({
                equipo: req.body.equipo.trim(),
                falla: req.body.falla
            }, {
                where: { id_ticket: req.params.id_cliente } // Se mapea contra la ID del ticket
            });

            res.redirect('/');
        } catch (error) {
            res.send("Error al guardar los datos relacionales: " + error.message);
        }
    },

        // Elimina una orden/ticket específico sin borrar al cliente de la base de datos
    delete: async (req, res) => {
        try {
            // Eliminamos directamente de la tabla TICKETS usando el ID que viene por parámetro
            await Ticket.destroy({
                where: { id_ticket: req.params.id_cliente } // req.params.id_cliente mapea al ID del ticket
            });
            
            res.redirect('/'); // Volvemos a la lista principal con los cambios aplicados
        } catch (error) {
            res.send("Error al eliminar el ticket de reparación: " + error.message);
        }
    },



        // 7. Detalle del Cliente (Modificado para inyectar Mano de Obra y Compatibilidades)
    detalle: async (req, res) => {
        try {
            const ticket = await Ticket.findByPk(req.params.id_cliente, { 
                include: [{ model: Cliente, as: 'cliente' }],
                nest: true
            });
            
            const HardwareModel = require('../database/models/Hardware');
            const db = require('../database/db');
            const Hardware = HardwareModel(db, require('sequelize').DataTypes);
            
            const repuestosDisponibles = await Hardware.findAll({
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
                id_cliente: ticket.id_ticket,
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
                mano_obra: ticket.mano_obra || 0 // ⬅️ Enviamos la mano de obra a la vista
            };

            res.render('detalleCliente', { 
                title: 'Detalle del Ticket', 
                cliente: mapeoClienteCompatibilidad,
                listaHardware: repuestosDisponibles,
                componentesGuardados: componentesGuardados,
                 usuarioSesion: req.session.usuarioLogueado // ⬅️ ¡ESTA LÍNEA CARGA AL USUARIO LOGUEADO!
            });
        } catch (error) {
            res.send("Error al cargar detalle: " + error.message);
        }
    },

    // 8. Guarda Cambios (Modificado para persistir el valor de la Mano de Obra)
          // 8. Actualiza los estados financieros del ticket, guarda repuestos y descuenta stock automáticamente
   updateStatus: async (req, res) => {
    const db = require('../database/db'); // Conexión base de Sequelize
    const transaction = await db.transaction(); // Iniciamos una transacción segura para evitar datos corruptos
    
    try {
        // 🛠️ SOLUCIÓN DEFINITIVA: Extraemos los modelos directamente desde la conexión activa de db
        // Esto evita tener que ejecutar los archivos de modelos como funciones o clases manualmente
        const Ticket = db.models.Ticket;
        const Hardware = db.models.Hardware;

        // Seguro de fallos secundario por si los nombres de tus alias varían (por ejemplo, en minúsculas)
        const modeloTicket = Ticket || db.models.ticket || db.models.Usuario; 
        const modeloHardware = Hardware || db.models.hardware || db.models.Hardware;

        let fechaEgreso = null;
        if (req.body.estado === 'Listo') {
            fechaEgreso = new Date().toISOString().slice(0, 10);
        }

        // 1. Buscamos el estado previo del ticket para saber qué repuestos ya tenía asignados históricamente
        const ticketPrevio = await modeloTicket.findByPk(req.params.id_cliente, { transaction });
        let componentesViejos = [];
        try {
            componentesViejos = JSON.parse(ticketPrevio.componentes_json || '[]');
        } catch (e) {
            componentesViejos = [];
        }

        // 2. Capturamos los nuevos componentes enviados por el formulario de la vista
        let listaComponentesInput = req.body.componentes_array_json || '[]';
        let componentesNuevos = [];
        try {
            componentesNuevos = JSON.parse(listaComponentesInput);
        } catch (e) {
            componentesNuevos = [];
        }

        // 🛡️ SANEAR ENTRADAS NUMÉRICAS
        const presupuestoFinal = parseFloat(req.body.presupuesto) || 0;
        const manoObraFinal = parseFloat(req.body.mano_obra) || 0;
        let pagoParcialFinal = parseFloat(req.body.pago_parcial) || 0;
        if (pagoParcialFinal < 0) {
            pagoParcialFinal = 0.00;
        }

        // 🔍 CONTROL AUTOMÁTICO DE STOCK: Mapeamos variaciones por el Nombre/Componente del artículo
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

        // Evaluamos artículo por artículo para actualizar Clever Cloud
        for (let nombreArticulo of todosLosItems) {
            const cantidadVieja = conteoViejos[nombreArticulo] || 0;
            const cantidadNueva = conteoNuevos[nombreArticulo] || 0;
            
            const diferencia = cantidadNueva - cantidadVieja;

            if (diferencia !== 0) {
                // Buscamos el repuesto físico en el catálogo de hardware por su nombre
                const articuloStock = await modeloHardware.findOne({ 
                    where: { componente: nombreArticulo }, 
                    transaction 
                });

                if (articuloStock) {
                    let nuevoStockCalculado = articuloStock.stock - diferencia;
                    if (nuevoStockCalculado < 0) nuevoStockCalculado = 0; // Evitamos stock negativo físico

                    await modeloHardware.update(
                        { stock: nuevoStockCalculado },
                        { where: { id_hardware: articuloStock.id_hardware }, transaction }
                    );
                }
            }
        }

        // 3. Si todo el mapeo de stock fue exitoso, guardamos la ficha del cliente
        await modeloTicket.update({
            estado: req.body.estado,
            presupuesto: presupuestoFinal,
            pago_parcial: pagoParcialFinal,
            confirmado: req.body.checkbox_confirmado === 'true' || req.body.checkbox_confirmado === true || req.body.checkbox_confirmado === 'on',
            fecha_egreso: fechaEgreso,
            componentes_json: listaComponentesInput,
            mano_obra: manoObraFinal
        }, { 
            where: { id_ticket: req.params.id_cliente }, 
            transaction 
        });

        // Confirmamos la transacción liberando los candados en MySQL
        await transaction.commit();
        res.redirect(`/detalle/${req.params.id_cliente}?actualizado=true`);

    } catch (error) {
        // Si algo falla en el proceso, deshacemos los cambios para cuidar tu inventario
        if (transaction) await transaction.rollback();
        res.send("Error crítico al actualizar el ticket y procesar el stock automático: " + error.message);
    }
},


    // 5. Historial completo de movimientos de caja
    history: async (req, res) => {
        try {
            const todosLosTickets = await Ticket.findAll({
                include: [{ model: Cliente, as: 'cliente' }],
                raw: true,
                nest: true
            });

            // Re-mapeamos la lista para compatibilidad inmediata con tu vista history.ejs actual
            const listaMapeada = todosLosTickets.map(t => ({
                createdAt: t.createdAt,
                nombre: t.cliente.nombre,
                equipo: t.equipo,
                falla: t.falla,
                fecha_egreso: t.fecha_egreso,
                presupuesto: t.presupuesto,
                pago_parcial: t.pago_parcial,
                confirmado: t.confirmado
            }));
            
            let estadisticasMensuales = {};
            listaMapeada.forEach(item => {
                let fecha = new Date(item.createdAt);
                let mesAnio = fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
                mesAnio = mesAnio.charAt(0).toUpperCase() + mesAnio.slice(1);

                let totalPresupuesto = Number(item.presupuesto || 0);
                let totalCobrado = Number(item.pago_parcial || 0);
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

            res.render('historial', { 
                title: 'Historial de Clientes', 
                lista: listaMapeada,
                estadisticas: estadisticasMensuales,
                usuarioSesion: req.session.usuarioLogueado // ⬅️ ¡ESTA LÍNEA CARGA AL USUARIO LOGUEADO!
            });
        } catch (error) {
            res.send("Error en el historial: " + error.message);
        }
    },

        // Muestra la vista del formulario de consulta pública para el cliente
    consultaReparacion: (req, res) => {
        try {
            // Buscamos el archivo views/consultaPublica.ejs
            res.render('consultaPublica', { 
                title: 'Consulta de Reparación', 
                cliente: null, 
                error: null 
            });
        } catch (error) {
            res.send("Error al cargar la vista de consulta: " + error.message);
        }
    },
        buscarEstadoCliente: async (req, res) => {
        try {
            // Captura el ticket enviado por el formulario (Ej: TICKET-A4F8)
            const ticketIngresado = req.body.codigo.toUpperCase().trim();
            
            // Buscamos el ticket e incluimos los datos fijos de su dueño (Cliente)
            const ticket = await Ticket.findOne({
                where: { codigo_seguimiento: ticketIngresado },
                include: [{ model: Cliente, as: 'cliente' }],
                nest: true
            });

            // Si el ticket no existe en Clever Cloud, recargamos con el mensaje de error
            if (!ticket) {
                return res.render('consultaPublica', { 
                    title: 'Consulta de Reparación', 
                    cliente: null, 
                    error: 'El número de ticket ingresado no existe. Por favor, verifíquelo.' 
                });
            }

            // Si existe, armamos el objeto limpio y seguro (solo lectura) para el cliente
            const mapeoPublico = {
                codigo_seguimiento: ticket.codigo_seguimiento,
                estado: ticket.estado,
                nombre: ticket.cliente.nombre,
                equipo: ticket.equipo,
                falla: ticket.falla,
                presupuesto: ticket.presupuesto,
                pago_parcial: ticket.pago_parcial,
                confirmado: ticket.confirmado
            };

            // Renderizamos la plantilla con los datos del equipo encontrados
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

module.exports = indexController
