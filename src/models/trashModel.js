const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./userModel");

const Trash = sequelize.define("Trash", {
    trash_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: '삭제된 게시글 ID'
    },
    original_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '원본 게시글 ID'
    },
    board_type: {
        type: DataTypes.ENUM('board', 'senior_board'),
        allowNull: false,
        comment: '게시판 타입'
    },
    writer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '작성자 ID',
        references: {
            model: User,
            key: 'user_id'
        }
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '제목'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '내용'
    },
    report_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '신고 횟수'
    },
    gpt_score: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: 'GPT 유해성 점수'
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '삭제 일자'
    }
}, {
    tableName: "trash",
    timestamps: false,
    comment: '삭제된 게시글 보관 테이블'
});

// User 모델과의 관계 정의
Trash.belongsTo(User, {
    foreignKey: 'writer_id',
    targetKey: 'user_id'
});

module.exports = Trash; 