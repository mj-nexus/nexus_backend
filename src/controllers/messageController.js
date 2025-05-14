const messageService = require('../services/messageService');
const { chat_rooms, Message, User } = require("../models");

// 메시지 생성
exports.createMessage = async (req, res) => {
  try {
    const { chat_room_id, sender_id, content, message_type } = req.body;

    const message = await messageService.sendMessage({
      chat_room_id,
      sender_id,
      content,
      message_type
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("메시지 생성 오류:", error);
    res.status(500).json({ success: false, error: "메시지 생성 실패" });
  }
};

// 특정 채팅방의 메시지 목록 가져오기
exports.getMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await messageService.getMessagesByRoom(roomId);
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("메시지 조회 오류:", error);
    res.status(500).json({ success: false, error: "메시지 조회 실패" });
  }
};

// 특정 유저가 속한 채팅방 목록 가져오기
exports.getMessageRoomId = async (req, res) => {
  try {
    const { userId } = req.params;

    const roomIds = await messageService.getMessageRoomId(userId);
    res.status(200).json({ success: true, roomIds });
  } catch (error) {
    console.error("채팅방 ID 조회 오류:", error);
    res.status(500).json({ success: false, error: "채팅방 ID 조회 실패" });
  }
};

// 채팅방 상세 정보 가져오기
exports.getMessageInfo = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await messageService.getMessageRoomList(roomId);
    res.status(200).json({ success: true, room });
  } catch (error) {
    console.error("채팅방 정보 조회 오류:", error);
    res.status(500).json({ success: false, error: "채팅방 조회 실패" });
  }
};

// 개별 메시지 조회
exports.getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["user_id", "name"]
        },
        {
          model: chat_rooms,
          attributes: ["id", "name"]
        }
      ]
    });

    if (!message) {
      return res.status(404).json({ success: false, error: "메시지를 찾을 수 없습니다." });
    }

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error("단일 메시지 조회 오류:", error);
    res.status(500).json({ success: false, error: "조회 실패" });
  }
};
