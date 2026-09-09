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
            allowNull: false
        },
        password: {
            type: dataTypes.STRING(255), 
            allowNull: false
        },
        rol: {
            type: dataTypes.ENUM('superadmin', 'admin', 'tecnico'),
            allowNull: false,
            defaultValue: 'tecnico' 
        },
        // ➕ NUEVA COLUMNA: Almacena el nombre del archivo de imagen del operador
        foto: {
            type: dataTypes.STRING(255),
            allowNull: true,
            defaultValue: 'default-user.png' // Avatar de respaldo si no sube foto
        },
        // ➕ VINCULACIÓN MULTITENANT MANDATORIA:
        id_comercio: {
            type: dataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1 // Por defecto mapea al taller inicial semilla
        }
    };
    const config = {
        tableName: "usuarios",
        timestamps: true 
    };

    const Usuario = sequelize.define(alias, cols, config);
    return Usuario;
};
