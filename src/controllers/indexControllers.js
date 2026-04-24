const Cliente = require('../database/models/Cliente.js');

const indexController = {
    // Renderiza la página y muestra la lista
    index: async (req, res) => {
        try {
            const clientes = await Cliente.findAll();
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
    }
};

module.exports = indexController;
