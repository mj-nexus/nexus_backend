const { chat_room_users, chat_rooms, Message } = require("../models");

/**
 * 메시지를 저장하는 서비스
 */
exports.sendMessage = async (data) => {
  return await Message.create(data);
};

/**
 * 채팅방 내 메시지 목록 조회
 */
exports.getMessagesByRoom = async (chat_room_id) => {
  return await Message.findAll({
    where: { chat_room_id },
    order: [["sent_at", "ASC"]]
  });
};

/**
 * 특정 유저가 속한 채팅방 ID 목록 조회
 */
exports.getMessageRoomId = async (userId) => {
  const roomEntries = await chat_room_users.findAll({
    where: { user_id: userId },
    attributes: ["chat_room_id"]
  });

  return roomEntries.map((entry) => entry.chat_room_id);
};

/**
 * 채팅방 ID로 상세 정보 조회
 */
exports.getMessageRoomList = async (roomId) => {
  return await chat_rooms.findByPk(roomId, {
    attributes: ["id", "name", "is_group", "created_at"]
  });
};
