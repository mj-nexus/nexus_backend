const sequelize = require("../config/db");

const User = require("./userModel");
const Board = require("./boardModel");
const Profile = require("./profileModel");

// Define relationships
User.hasMany(Board, { foreignKey: 'writer' });
Board.belongsTo(User, { foreignKey: 'writer' });

User.hasOne(Profile, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Profile.belongsTo(User, {
    foreignKey: 'user_id'
});

module.exports = { sequelize, Board, User, Profile };