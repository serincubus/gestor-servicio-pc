// src/database/db.js - CONFIGURACIÓN MULTITENANT CON RELACIONES ACTIVAS
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// 1. Inicializamos la conexión nativa con Clever Cloud
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

// 2. Contenedor exclusivo para los Modelos Físicos
const modelos = {};

// Sincronizamos los modelos pasándole la carpeta relativa exacta
modelos.Comercio = require('./models/Comercio')(sequelize, DataTypes);
modelos.Usuario  = require('./models/Usuario')(sequelize, DataTypes);

// 🛠️ MAPEADOR RELACIONAL: Recorre el objeto limpio y activa los métodos ".associate"
Object.keys(modelos).forEach(modelName => {
    if (modelos[modelName].associate) {
        modelos[modelName].associate(modelos); // ⬅️ Pasa el mapa de modelos vinculados
        console.log(`🔗 Asociación activada exitosamente para el modelo: ${modelName}`);
    }
});

// Adjuntamos el mapa de modelos limpios a la instancia para la consulta de controladores
sequelize.models = modelos; 

module.exports = sequelize;
