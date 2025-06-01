const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// 게시글 신고
router.post('/post', reportController.reportPost);

module.exports = router; 