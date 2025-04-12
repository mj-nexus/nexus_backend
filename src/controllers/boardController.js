const boardService = require('../services/boardService');

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

exports.deleteBoard = async (req, res) => {
  try {
    const result = await boardService.deleteBoard(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
