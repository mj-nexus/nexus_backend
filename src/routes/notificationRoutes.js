const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// 모든 요청에 인증 미들웨어 적용 제거

// 알림 목록 조회
router.get("/:user_id", notificationController.getUserNotifications);

// 읽지 않은 알림 개수 조회
router.get("/:user_id/unread-count", notificationController.getUnreadNotificationCount);

// 알림 읽음 상태로 변경
router.patch("/:user_id/:notification_id/read", notificationController.markNotificationAsRead);

// 모든 알림 읽음 상태로 변경
router.patch("/:user_id/read-all", notificationController.markAllNotificationsAsRead);

// 알림 삭제
router.delete("/:user_id/:notification_id", notificationController.deleteNotification);

module.exports = router; 