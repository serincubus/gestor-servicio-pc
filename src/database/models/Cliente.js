const { DataTypes } = require('sequelize');
const db = require('../db');

const Cliente = db.define('Cliente', {
    id_cliente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING
    },
    equipo: {
        type: DataTypes.STRING, // Ej: "Laptop HP" o "PC Escritorio"
        allowNull: false
    },
    falla: {
        type: DataTypes.TEXT // Descripción del problema
    },
    estado: {
        type: DataTypes.STRING,
        defaultValue: 'Ingresado' // Estados: Ingresado, En Revisión, Listo, Entregado
    }
    },
     {
    tableName: 'clientes', // <--- FORZAMOS minúsculas
    freezeTableName: true, // <--- Evita que Sequelize lo pluralice a su gusto
    timestamps: true       // Crea createdAt y updatedAt (estándar de Sequelize)
});


module.exports = Cliente;
