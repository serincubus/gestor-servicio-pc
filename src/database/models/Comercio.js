// src/database/models/Comercio.js
module.exports = (sequelize, dataTypes) => {
    const alias = "Comercio";
    const cols = {
        id_comercio: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre_taller: {
            type: dataTypes.STRING(100),
            allowNull: false
        },
        telefono_contacto: {
            type: dataTypes.STRING(30),
            allowNull: true
        },
        direccion_fisica: {
            type: dataTypes.STRING(150),
            allowNull: true
        },
        cuit_o_id_legal: {
            type: dataTypes.STRING(50),
            allowNull: true
        },
        logo_url: {
            type: dataTypes.STRING(255),
            allowNull: true,
            defaultValue: 'default-logo-taller.png'
        },
        activo: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true // Permite dar de baja un taller si no paga la cuota mensual
        }
    };
    const config = {
        tableName: "comercios",
        timestamps: true // Registra la fecha de alta del cliente en tu SaaS
    };

    const Comercio = sequelize.define(alias, cols, config);
    return Comercio;
};
