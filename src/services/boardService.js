const Board  = require('../models/boardModel');

exports.createBoard = async (data) => {
  return await Board.create(data);
};

exports.getAllBoards = async () => {
  return await Board.findAll();
};

exports.getBoardById = async (id) => {
  return await Board.findByPk(id);
};

exports.getUserBoards = async (userId) => {
  return await Board.findAll({
    where: {
      writer_id: userId
    },
    order: [
        ['regdate', 'DESC']
    ]
  });
};

exports.deleteBoard = async (id) => {
  const board = await Board.findByPk(id);
  if (!board) return null;
  await board.destroy();
  return true;
};
