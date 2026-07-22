module.exports = (sequelize, dataTypes) => {
    const alias = "Usuario";
    const cols = {
        id_usuario: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: dataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        password: {
            type: dataTypes.STRING(255), // Aquí guardarás la contraseña (idealmente con bcrypt)
            allowNull: false
        },
        rol: {
            type: dataTypes.ENUM('admin', 'tecnico'),
            allowNull: false,
            defaultValue: 'tecnico' // Menor jerarquía por defecto
        }
    };
    const config = {
        tableName: "usuarios",
        timestamps: true
    };

    const Usuario = sequelize.define(alias, cols, config);
    return Usuario;
};
