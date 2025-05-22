const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./userModel");
const Board = require("./boardModel");

const Comment = sequelize.define("Comment", {
    comment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: "댓글 ID"
    },
    board_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "게시글 ID",
        references: {
            model: Board,
            key: "board_id"
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "작성자 ID",
        references: {
            model: User,
            key: "user_id"
        }
    },
    content: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        comment: "댓글 내용"
    },
    regdate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: "작성일자"
    },
    updatedate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: "수정일자"
    },
    deletedate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "삭제일자"
    }
}, {
    tableName: "comments",
    timestamps: false,
    comment: "게시판 댓글 테이블"
});

// 관계 설정
Comment.belongsTo(User, { foreignKey: "user_id", targetKey: "user_id" });
Comment.belongsTo(Board, { foreignKey: "board_id", targetKey: "board_id" });

module.exports = Comment; 