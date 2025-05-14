const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const chat_room_usersModel = sequelize.define("chat_room_users", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    chat_room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    }
},
    {
        tableName: "chat_room_users",
        timestamps: false,
        createdAt: true,
        updatedAt: true,
    })
module.exports = chat_room_usersModel