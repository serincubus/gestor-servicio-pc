// controllers/userControllers.js

const userControllers = {
    // Muestra el formulario de inicio de sesión para el técnico administrador
    loginVista: (req, res) => {
        res.render('login', { title: 'Acceso Técnico', error: null });
    },

    // Procesa las credenciales ingresadas por el administrador
    procesarLogin: (req, res) => {
        const { password } = req.body;
        
        // DEFINÍ AQUÍ LA CONTRASEÑA DE ADMINISTRADOR
        if (password === 'admin123') {
            req.session.esAdmin = true; // Guardamos el estado de autorización en la sesión
            return res.redirect('/');   // Redirigimos al panel principal seguro
        } else {
            return res.render('login', { title: 'Acceso Técnico', error: 'Contraseña incorrecta.' });
        }
    },

    // Cierra la sesión del administrador de forma segura
    logout: (req, res) => {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    }
};

module.exports = userControllers;
