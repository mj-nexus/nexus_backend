const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Notification = sequelize.define("Notification", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: "알림 유형 (new_message, friend_request, mention 등)"
    },
    content: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "알림 내용 미리보기"
    },
    reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "참조 ID (메시지 ID, 게시글 ID 등)"
    },
    chat_room_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "관련 채팅방 ID (메시지 알림일 경우)"
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "notifications",
    timestamps: false,
    indexes: [
        {
            name: "idx_notification_user",
            fields: ["user_id"]
        },
        {
            name: "idx_notification_read",
            fields: ["user_id", "is_read"]
        }
    ]
});

module.exports = Notification; 