const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const ChatRoomsModel = sequelize.define('ChatRoomsModel', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_group: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
},
    {
        tableName: 'chat_rooms',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    })
module.exports = ChatRoomsModel;