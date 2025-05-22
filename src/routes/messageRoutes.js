const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// 메시지 보내기 (POST /api/messages)
router.post("/", messageController.createMessage);

// 특정 채팅방의 메시지 목록 조회 (GET /api/messages/room/:roomId)
router.get("/room/:roomId", messageController.getMessagesByRoom);

// 개별 메시지 조회 (GET /api/messages/:id)
router.get("/:id", messageController.getMessageById);

// 특정 유저가 속한 채팅방 ID 목록 조회 (GET /api/messages/user/:userId/rooms)
router.get("/user/:userId/rooms", messageController.getMessageRoomId);

// 채팅방 ID로 상세 정보 조회 (GET /api/messages/room-info/:roomId)
router.get("/room-info/:roomId", messageController.getMessageInfo);

// 새로운 채팅방 생성 (POST /api/messages/chat-room)
router.post("/chat-room", messageController.createChatRoom);

// 채팅방 사용자 목록 조회 (GET /api/messages/chat-room/:roomId/users)
router.get("/chat-room/:roomId/users", messageController.getChatRoomUsers);

// 사용자가 참여한 모든 채팅방 목록 조회 (GET /api/messages/user/:userId/chat-rooms)
router.get("/user/:userId/chat-rooms", messageController.getUserChatRooms);

// 채팅방 삭제 (DELETE /api/messages/chat-room/:roomId)
router.delete("/chat-room/:roomId", messageController.deleteChatRoom);

module.exports = router;
