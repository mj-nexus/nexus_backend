const boardService = require('../services/boardService');
const {getUserById} = require("./userController");

exports.createBoard = async (req, res) => {
  try {
    const board = await boardService.createBoard(req.body);
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBoards = async (req, res) => {
  try {
    const boards = await boardService.getAllBoards();
    res.json(boards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBoard = async (req, res) => {
  try {
    const board = await boardService.getBoardById(req.params.id);
    if (!board) return res.status(404).json({ error: 'Not found' });
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserBoards = async (req, res) => {
  try {
    const { userId } = req.params;
    const board = await boardService.getUserBoards(userId);
    if (!board || board.length === 0) {
      return res.status(404).json({
        message: "해당 사용자의 게시글이 없습니다."
      });
    }

    res.json(board);
  } catch (err) {
    throw err;
  }
}

exports.deleteBoard = async (req, res) => {
  try {
    const result = await boardService.deleteBoard(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
