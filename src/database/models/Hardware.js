module.exports = (sequelize, dataTypes) => {
    const alias = "Hardware";
    const cols = {
        id_hardware: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        componente: {
            type: dataTypes.STRING(100),
            allowNull: false
        },
        categoria: {
            type: dataTypes.STRING(50), // Memorias RAM, Discos Sólidos, Combos, etc.
            allowNull: false
        },
        precio_costo: {
            type: dataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        precio_venta: {
            type: dataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        stock: {
            type: dataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
         imagen: {
            type: dataTypes.STRING(255),
            allowNull: true,
            defaultValue: 'default-hardware.png' // Imagen comodín por defecto
        }
    };
    const config = {
        tableName: "hardware",
        timestamps: true // Crea automáticamente createdAt y updatedAt
    };

    const Hardware = sequelize.define(alias, cols, config);
    return Hardware;
};
