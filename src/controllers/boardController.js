const boardService = require('../services/boardService');

exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  try {
    const newBoardPost = await boardService.createPost(title, content);
    res.status(201).json(newBoardPost);
  } catch (error) {
    res.status(500).json({ error: '게시판 포스트 작성 실패' });
  }
};
