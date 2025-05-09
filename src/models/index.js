const sequelize = require("../config/db");

const User = require("./userModel");
const Board = require("./boardModel");
const Profile = require("./profileModel");

// Board-User 관계 설정
User.hasMany(Board, {
    foreignKey: 'writer_id',  // writer -> writer_id로 수정
    sourceKey: 'user_id'      // sourceKey 추가
});
Board.belongsTo(User, {
    foreignKey: 'writer_id',  // writer -> writer_id로 수정
    targetKey: 'user_id'      // targetKey 추가
});

// User-Profile 관계 설정
User.hasOne(Profile, {
    foreignKey: 'user_id',
    sourceKey: 'user_id',     // sourceKey 추가
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Profile.belongsTo(User, {
    foreignKey: 'user_id',
    targetKey: 'user_id'      // targetKey 추가
});

module.exports = { sequelize, Board, User, Profile };