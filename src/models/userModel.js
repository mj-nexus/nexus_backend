const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
    },
    student_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(256),
        allowNull: false
    },
    lastReadMessageId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    onlineStatus: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
}, {
    tableName: "users",
    timestamps: false,
});
module.exports = User;