const Post = require('../models/Post');
const postService = require('../services/postService');

exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  try {
    const newPost = await postService.createPost(title, content, req.user.id);
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: '포스트 생성 실패' });
  }
};
