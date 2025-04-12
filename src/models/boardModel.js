const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require('./userModel');

const Board = sequelize.define("Board", {
    board_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: '게시판ID'
    },
    writer: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '작성자 이름'
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
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '제목'
    },
    content: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        comment: '내용'
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '조회수'
    },
    tag: {
        type: DataTypes.STRING(3),
        allowNull: false,
        comment: '말머리'
    },
    regdate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '등록일자'
    },
    updatedate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '수정일자'
    },
    deletedate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '삭제일자'
    }
}, {
    tableName: "board",
    timestamps: false,
    comment: '게시판 테이블'
});

// User 모델과의 관계 정의
Board.belongsTo(User, {
    foreignKey: 'writer_id',
    targetKey: 'user_id'
});

module.exports = Board;