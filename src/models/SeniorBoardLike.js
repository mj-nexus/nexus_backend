const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SeniorBoardLike = sequelize.define('SeniorBoardLike', {
    board_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'senior_board',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'senior_board_likes',
    timestamps: false
  });

  return SeniorBoardLike;
}; 