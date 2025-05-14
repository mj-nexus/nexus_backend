const sequelize = require("../config/db");

const User = require("./userModel");
const Board = require("./boardModel");
const Profile = require("./profileModel");
const Message = require("./messageModel");
const chat_rooms = require("./chat_roomsModel");
const chat_room_users = require("./chat_room_usersModel");


// Board - User (1:N)
User.hasMany(Board, {
    foreignKey: 'writer_id',
    sourceKey: 'user_id'
});
Board.belongsTo(User, {
    foreignKey: 'writer_id',
    targetKey: 'user_id'
});

// User - Profile (1:1)
User.hasOne(Profile, {
    foreignKey: 'user_id',
    sourceKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Profile.belongsTo(User, {
    foreignKey: 'user_id',
    targetKey: 'user_id'
});

// User - chat_room_users (1:N)
User.hasMany(chat_room_users, {
    foreignKey: 'user_id',
    sourceKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
chat_room_users.belongsTo(User, {
    foreignKey: 'user_id',
    targetKey: 'user_id'
});

// chat_rooms - chat_room_users (1:N)
chat_rooms.hasMany(chat_room_users, {
    foreignKey: 'chat_room_id',
    sourceKey: 'id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
chat_room_users.belongsTo(chat_rooms, {
    foreignKey: 'chat_room_id',
    targetKey: 'id'
});

// chat_rooms - Message (1:N)
chat_rooms.hasMany(Message, {
    foreignKey: 'chat_room_id',
    sourceKey: 'id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Message.belongsTo(chat_rooms, {
    foreignKey: 'chat_room_id',
    targetKey: 'id'
});

// User - Message (1:N)
User.hasMany(Message, {
    foreignKey: 'sender_id',
    sourceKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Message.belongsTo(User, {
    foreignKey: 'sender_id',
    targetKey: 'user_id'
});

module.exports = {
    sequelize,
    User,
    Board,
    Profile,
    Message,
    chat_rooms,
    chat_room_users
};
