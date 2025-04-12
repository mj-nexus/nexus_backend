const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./userModel");

const Profile = sequelize.define("Profile", {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    user_name: {
        type: DataTypes.STRING(4), 
        allowNull: false
    },
    nick_name: {
        type: DataTypes.STRING(20), 
        allowNull: false,
        defaultValue: ""
    },
    profile_image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bio: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: "user_profiles"
});

module.exports = Profile;