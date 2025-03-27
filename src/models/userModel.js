const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
    name: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
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
    email: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(256),
        allowNull: false
    },
    company: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    skill: {
        type: DataTypes.JSON
    }
}, {
    tableName: "users",
    timestamps: false,
});

module.exports = User;
