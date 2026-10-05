module.exports = (sequelize, dataTypes) => {
    const alias = "Ticket";
    const cols = {
        id_ticket: { type: dataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_cliente: { type: dataTypes.INTEGER, allowNull: false },
        codigo_seguimiento: { type: dataTypes.STRING(20), allowNull: false },
        equipo: { type: dataTypes.STRING(100), allowNull: false },
        falla: { type: dataTypes.TEXT },
        estado: { type: dataTypes.STRING(50), defaultValue: 'Ingresado' },
        presupuesto: { type: dataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
        mano_obra: { type: dataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0.00 },
        pago_parcial: { type: dataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
        confirmado: { type: dataTypes.BOOLEAN, defaultValue: false },
        fecha_egreso: { type: dataTypes.DATEONLY },
        componentes_json: { type: dataTypes.TEXT, allowNull: true, defaultValue: '[]' },
        id_comercio: { type: dataTypes.INTEGER, allowNull: false, }
    };
    const config = { tableName: 'tickets', timestamps: true };

    const Ticket = sequelize.define(alias, cols, config);

    Ticket.associate = function(models) {
        Ticket.belongsTo(models.Cliente, { as: 'cliente', foreignKey: 'id_cliente' });
        Ticket.belongsTo(models.Comercio, { as: 'comercio', foreignKey: 'id_comercio' });
    };

    return Ticket;
};