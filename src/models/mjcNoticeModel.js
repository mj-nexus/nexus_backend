const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const MjcNotice = sequelize.define("MjcNotice", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: '공지사항 ID'
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '공지사항 제목'
    },
    link: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true,
        comment: '공지사항 링크'
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: '생성 일자'
    }
}, {
    tableName: "mjc_notices",
    timestamps: false,
    comment: '명지전문대 공지사항 테이블'
});

module.exports = MjcNotice; 