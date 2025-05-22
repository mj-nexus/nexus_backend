const express = require("express");
const router = express.Router();
const mjcNoticeController = require("../controllers/mjcNoticeController");

// 명지전문대 공지사항 크롤링 및 저장하는 엔드포인트
router.post("/crawl", mjcNoticeController.crawlAndSaveNotices);

// 모든 공지사항 조회
router.get("/", mjcNoticeController.getAllNotices);

// 특정 공지사항 상세 조회
router.get("/:id", mjcNoticeController.getNoticeById);

// 최근 공지사항 조회 (기본 5개)
router.get("/latest/list", mjcNoticeController.getLatestNotices);

module.exports = router; 