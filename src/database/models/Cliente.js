// src/database/models/Cliente.js
module.exports = (sequelize, dataTypes) => {
    const alias = "Cliente";
    const cols = {
        id_cliente: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: dataTypes.STRING(100),
            allowNull: false
        },
        telefono: {
            type: dataTypes.STRING(30),
            allowNull: true
        },
        email: {
            type: dataTypes.STRING(100),
            allowNull: true
        },
        direccion: {
            type: dataTypes.STRING(150),
            allowNull: true
        },
        // ➕ VINCULACIÓN MULTITENANT
        id_comercio: {
            type: dataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1   // ⚠️ quitarlo después de la migración inicial
        }
    };
    const config = {
        tableName: "clientes",
        timestamps: true
    };

    const Cliente = sequelize.define(alias, cols, config);

    Cliente.associate = function(models) {
        Cliente.hasMany(models.Ticket, {
            as: "tickets",
            foreignKey: "id_cliente"
        });
        Cliente.belongsTo(models.Comercio, {
            as: "comercio",
            foreignKey: "id_comercio"
        });
    };

    return Cliente;
};