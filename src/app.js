var createError = require('http-errors');
var express = require('express');
const session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config(); // IMPORTANTE: Esto debe ir al principio

// Conexión centralizada e inicialización de modelos lógicos en la nube
const db = require('./database/db.js');
const Cliente = require('./database/models/Cliente.js');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const hardwareRouter = require('./routes/hardware');
const historialRouter = require('./routes/historial'); // Importa tu nuevo router de historial

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.set('trust proxy', 1);
app.use(session({
    secret: 'clave-secreta-taller-pc', // Llave de encriptación de seguridad
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // La sesión expira en 1 hora de inactividad
}));

// Puentes de enrutamiento del ecosistema de Express activos
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/hardware', hardwareRouter);

// 🛠️ CORRECCIÓN CRÍTICA: Se cambió a '/' para sincronizarse con la declaración interna router.get('/historial')
app.use('/', historialRouter); 

// Sincronización transaccional perimetral con Clever Cloud
db.sync({ alter: true })
    .then(() => {
        console.log('✅ TABLA CREADA EXITOSAMENTE EN LA NUBE');
    })
    .catch(err => {
        console.log('❌ ERROR REAL AL CREAR:', err.message);
    });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
