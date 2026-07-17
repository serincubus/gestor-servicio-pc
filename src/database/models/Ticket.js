const { DataTypes } = require('sequelize');
const db = require('../db.js');

const Ticket = db.define('Ticket', {
    id_ticket: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    codigo_seguimiento: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    equipo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    falla: {
        type: DataTypes.TEXT
    },
    estado: {
        type: DataTypes.STRING(50),
        defaultValue: 'Ingresado'
    },
    presupuesto: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    pago_parcial: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    confirmado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    fecha_egreso: {
        type: DataTypes.DATEONLY
    },
    // Añadir esta columna dentro de cols en src/database/models/Ticket.js
    componentes_json: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '[]' // Por defecto inicia como un array vacío en formato texto
    }

}, {
    tableName: 'tickets',
    timestamps: true
});

module.exports = Ticket;
