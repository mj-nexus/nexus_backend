const express = require('express');
const router = express.Router();
const seniorBoardController = require('../controllers/seniorBoardController');

// 전체 조회
router.get('/', seniorBoardController.getAllBoards);
// 단일 조회
router.get('/:id', seniorBoardController.getBoardById);
// 생성
router.post('/', seniorBoardController.createBoard);
// 수정
router.put('/:id', seniorBoardController.updateBoard);
// 삭제
router.delete('/:id', seniorBoardController.deleteBoard);
// 좋아요
router.post('/like', seniorBoardController.likeBoard);
// 좋아요 취소
router.post('/unlike', seniorBoardController.unlikeBoard);

module.exports = router; 