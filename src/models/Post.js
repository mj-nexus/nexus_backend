const mysql = require('mysql2');
const db = require('../config/db'); // DB 연결 설정을 가져옵니다.

// Post 모델 정의
const Post = {
  // 모든 게시글을 가져오는 함수
  getAllPosts: () => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM posts ORDER BY created_at DESC', (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  // 특정 게시글을 가져오는 함수
  getPostById: (postId) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM posts WHERE post_id = ?', [postId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
  },

  // 새로운 게시글을 추가하는 함수
  createPost: (userId, title, content) => {
    return new Promise((resolve, reject) => {
      const createdAt = new Date();  // 게시글 작성 시간
      db.query(
        'INSERT INTO posts (user_id, title, content, created_at, views) VALUES (?, ?, ?, ?, ?)',
        [userId, title, content, createdAt, 0],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });
  },

  // 게시글을 수정하는 함수
  updatePost: (postId, title, content) => {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE posts SET title = ?, content = ? WHERE post_id = ?',
        [title, content, postId],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });
  },

  // 게시글을 삭제하는 함수
  deletePost: (postId) => {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM posts WHERE post_id = ?', [postId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  // 게시글 조회 수 증가하는 함수
  incrementViews: (postId) => {
    return new Promise((resolve, reject) => {
      db.query('UPDATE posts SET views = views + 1 WHERE post_id = ?', [postId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },
};

module.exports = Post;
