const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Profile = sequelize.define("Profile", {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    user_name: {
        type: DataTypes.STRING(4), 
        allowNull: false
    },
    nick_name: {
        type: DataTypes.STRING(20), 
        allowNull: true,
        defaultValue: ""
    },
    profile_image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bio: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "안녕하세요 잘부탁드려요"
    },
    email: {
        type: DataTypes.STRING(128),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    company: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    skill: {
        type: DataTypes.JSON
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
}, {
    tableName: "user_profiles",
    timestamps: false,
});

module.exports = Profile;