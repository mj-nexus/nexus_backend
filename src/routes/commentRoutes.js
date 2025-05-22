const express = require('express');
const commentController = require('../controllers/commentController');
const router = express.Router();

// 댓글 생성
router.post('/', commentController.createComment);
// 게시글별 댓글 목록 조회
router.get('/board/:board_id', commentController.getCommentsByBoardId);
// 댓글 단일 조회
router.get('/:comment_id', commentController.getCommentById);
// 댓글 수정
router.patch('/:comment_id', commentController.updateComment);
// 댓글 삭제
router.delete('/:comment_id', commentController.deleteComment);

module.exports = router; 