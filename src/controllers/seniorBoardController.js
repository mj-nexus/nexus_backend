const { SeniorBoard, SeniorBoardLike, User, Profile } = require('../models');
const { Op } = require('sequelize');

// 시니어보드 전체 조회
exports.getAllBoards = async (req, res) => {
  try {
    const boards = await SeniorBoard.findAll({
      order: [['regdate', 'DESC']],
      include: [
        { model: User, attributes: ['user_id', 'student_id'], include: [{ model: Profile, attributes: ['company'] }] }
      ]
    });
    res.json(boards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 시니어보드 단일 조회
exports.getBoardById = async (req, res) => {
  try {
    const board = await SeniorBoard.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['user_id', 'student_id'], include: [{ model: Profile, attributes: ['company'] }] }
      ]
    });
    if (!board) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    // 조회수 증가
    board.views += 1;
    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 시니어보드 생성
exports.createBoard = async (req, res) => {
  try {
    const { writer_id, writer, title, content, note_type, note_color } = req.body;
    const newBoard = await SeniorBoard.create({
      writer_id, writer, title, content, note_type, note_color
    });
    res.status(201).json(newBoard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 시니어보드 수정
exports.updateBoard = async (req, res) => {
  try {
    const board = await SeniorBoard.findByPk(req.params.id);
    if (!board) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    const { title, content, note_type, note_color } = req.body;
    board.title = title ?? board.title;
    board.content = content ?? board.content;
    board.note_type = note_type ?? board.note_type;
    board.note_color = note_color ?? board.note_color;
    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 시니어보드 삭제
exports.deleteBoard = async (req, res) => {
  try {
    const board = await SeniorBoard.findByPk(req.params.id);
    if (!board) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    await board.destroy();
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 좋아요 추가
exports.likeBoard = async (req, res) => {
  try {
    const { board_id, user_id } = req.body;
    const [like, created] = await SeniorBoardLike.findOrCreate({
      where: { board_id, user_id }
    });
    if (!created) return res.status(400).json({ error: '이미 좋아요를 눌렀습니다.' });
    // 게시글 좋아요 수 증가
    const board = await SeniorBoard.findByPk(board_id);
    board.likes += 1;
    await board.save();
    res.json({ message: '좋아요 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 좋아요 취소
exports.unlikeBoard = async (req, res) => {
  try {
    const { board_id, user_id } = req.body;
    const like = await SeniorBoardLike.findOne({ where: { board_id, user_id } });
    if (!like) return res.status(404).json({ error: '좋아요를 누르지 않았습니다.' });
    await like.destroy();
    // 게시글 좋아요 수 감소
    const board = await SeniorBoard.findByPk(board_id);
    board.likes = Math.max(0, board.likes - 1);
    await board.save();
    res.json({ message: '좋아요 취소 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 