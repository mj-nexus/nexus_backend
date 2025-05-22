const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SeniorBoard = sequelize.define('SeniorBoard', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    writer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    writer: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    note_type: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    note_color: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    regdate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    moddate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'senior_board',
    timestamps: false,
    indexes: [
      {
        name: 'idx_writer_id',
        fields: ['writer_id']
      },
      {
        name: 'idx_regdate',
        fields: ['regdate']
      }
    ]
  });

  return SeniorBoard;
}; 