// src/database/db.js
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: parseInt(process.env.DB_PORT) || 3306,
        logging: false,
        pool: { max: 3, min: 0, acquire: 30000, idle: 10000 }
    }
);

// 📦 MAPA ÚNICO DE MODELOS
const modelos = {};

modelos.Comercio = require('./models/Comercio')(sequelize, DataTypes);
modelos.Usuario  = require('./models/Usuario')(sequelize, DataTypes);
modelos.Cliente  = require('./models/Cliente')(sequelize, DataTypes);   // ➕
modelos.Ticket   = require('./models/Ticket')(sequelize, DataTypes);    // ➕
modelos.TicketHardware = require('./models/TicketHardware')(sequelize, DataTypes);
modelos.Hardware= require('./models/Hardware')(sequelize, DataTypes);


// 🔗 ACTIVACIÓN DE ASOCIACIONES
Object.keys(modelos).forEach(modelName => {
    if (modelos[modelName].associate) {
        modelos[modelName].associate(modelos);
        console.log(`🔗 Asociación activada para: ${modelName}`);
    }
});

// Exponer el mapa para los controladores
sequelize.models = modelos;

module.exports = sequelize;