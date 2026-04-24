const { Sequelize } = require('sequelize');
require('dotenv').config();

const db = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: 3306,
        logging: false,
        pool: { max: 3, min: 0, acquire: 30000, idle: 10000 }
    }
);

module.exports = db; // <--- Solo exportamos la conexión
