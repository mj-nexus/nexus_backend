const Post = require('../models/Post');

exports.createPost = async (title, content, userId) => {
  const post = new Post({
    title,
    content,
    user_id: userId,
  });
  await post.save();
  return post;
};
