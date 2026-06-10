// src/database/models/Cliente.js
const { DataTypes } = require('sequelize');
const db = require('../db.js'); // Importamos tu conexión

const Cliente = db.define('Cliente', {
    id_cliente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: false
    }
}, {
    tableName: 'clientes',
    timestamps: true
});

module.exports = Cliente;
