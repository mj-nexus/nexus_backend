// models/index.js
const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const User = require("./userModel");
const Profile = require("./profileModel");
const Message = require("./messageModel");
const Board = require("./boardModel");
const Notice = require("./Post");
const ChatRoomsModel = require("./chat_roomsModel");
const chat_room_users = require("./chat_room_usersModel");
const MjcNotice = require("./mjcNoticeModel");
const Comment = require("./commentModel");
const SeniorBoard = require("./SeniorBoard")(sequelize);
const SeniorBoardLike = require("./SeniorBoardLike")(sequelize);
const Notification = require("./notificationModel");


// Board - User (1:N)
User.hasMany(Board, {
    foreignKey: 'writer_id',
    sourceKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Board.belongsTo(User, {
    foreignKey: 'writer_id',
    targetKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
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
    targetKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
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
    targetKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// chat_rooms - chat_room_users (1:N)
ChatRoomsModel.hasMany(chat_room_users, {
    foreignKey: 'chat_room_id',
    sourceKey: 'id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
chat_room_users.belongsTo(ChatRoomsModel, {
    foreignKey: 'chat_room_id',
    targetKey: 'id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// chat_rooms - Message (1:N)
ChatRoomsModel.hasMany(Message, {
    foreignKey: 'chat_room_id',
    sourceKey: 'id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Message.belongsTo(ChatRoomsModel, {
    foreignKey: 'chat_room_id',
    targetKey: 'id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
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
    targetKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// SeniorBoard - User (1:N)
User.hasMany(SeniorBoard, {
    foreignKey: 'writer_id',
    sourceKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
SeniorBoard.belongsTo(User, {
    foreignKey: 'writer_id',
    targetKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// SeniorBoard - SeniorBoardLike (1:N)
SeniorBoard.hasMany(SeniorBoardLike, {
    foreignKey: 'board_id',
    sourceKey: 'id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
SeniorBoardLike.belongsTo(SeniorBoard, {
    foreignKey: 'board_id',
    targetKey: 'id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// User - SeniorBoardLike (1:N)
User.hasMany(SeniorBoardLike, {
    foreignKey: 'user_id',
    sourceKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
SeniorBoardLike.belongsTo(User, {
    foreignKey: 'user_id',
    targetKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// User - Notification (1:N)
User.hasMany(Notification, {
    foreignKey: 'user_id',
    sourceKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Notification.belongsTo(User, {
    foreignKey: 'user_id',
    targetKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    as: 'recipient'
});

// User - Notification (as sender) (1:N)
User.hasMany(Notification, {
    foreignKey: 'sender_id',
    sourceKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Notification.belongsTo(User, {
    foreignKey: 'sender_id',
    targetKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    as: 'sender'
});

const db = {
    sequelize,
    Sequelize,
    User,
    Profile,
    Message,
    Board,
    Notice,
    ChatRoomsModel,
    chat_room_users,
    MjcNotice,
    Comment,
    SeniorBoard,
    SeniorBoardLike,
    Notification
};

module.exports = db;