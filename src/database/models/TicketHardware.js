module.exports = (sequelize, dataTypes) => {
    const alias = "TicketHardware";
    const cols = {
        id_ticket_hardware: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_ticket: {
            type: dataTypes.INTEGER,
            allowNull: false
        },
        id_hardware: {
            type: dataTypes.INTEGER,
            allowNull: false
        },
        precio_historico: {
            type: dataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    };
    const config = {
        tableName: "ticket_hardware",
        timestamps: false
    };

    const TicketHardware = sequelize.define(alias, cols, config);
    return TicketHardware;
};
