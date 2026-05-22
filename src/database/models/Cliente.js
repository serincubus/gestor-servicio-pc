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
    },
    fecha_egreso: {
    type: DataTypes.DATEONLY, // Guarda solo la fecha (AAAA-MM-DD) sin la hora
    allowNull: true
},
    // Añade esto dentro de db.define
presupuesto: {
    type: DataTypes.DECIMAL(10, 2), // Para guardar dinero (ej: 1500.50)
    defaultValue: 0.00
},
confirmado: {
    type: DataTypes.BOOLEAN, // true o false
    defaultValue: false
}

    },
     {
    tableName: 'clientes', // <--- FORZAMOS minúsculas
    freezeTableName: true, // <--- Evita que Sequelize lo pluralice a su gusto
    timestamps: true       // Crea createdAt y updatedAt (estándar de Sequelize)
});


module.exports = Cliente;
