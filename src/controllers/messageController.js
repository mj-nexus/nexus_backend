const messageService = require('../services/messageService');
const { chat_rooms, Message, User, ChatRoomsModel, chat_room_users } = require("../models");

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
    
    if (!room) {
      return res.status(404).json({ 
        success: false, 
        error: "채팅방을 찾을 수 없습니다." 
      });
    }
    
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

// 새로운 채팅방 생성
exports.createChatRoom = async (req, res) => {
  try {
    const { name, is_group, user_ids } = req.body;

    // 유효성 검사
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "유효한 사용자 ID 목록이 필요합니다." 
      });
    }

    // 그룹 채팅이 아닌 경우 이름 생략 가능
    if (is_group && !name) {
      return res.status(400).json({ 
        success: false, 
        error: "그룹 채팅방에는 이름이 필요합니다." 
      });
    }
    
    const result = await messageService.createChatRoom({
      name,
      is_group,
      user_ids
    });

    res.status(201).json({ 
      success: true, 
      message: "채팅방이 생성되었습니다.", 
      chatRoom: result.chatRoom 
    });
  } catch (error) {
    console.error("채팅방 생성 오류:", error);
    res.status(500).json({ 
      success: false, 
      error: "채팅방 생성 실패", 
      message: error.message 
    });
  }
};

// 채팅방 사용자 목록 조회
exports.getChatRoomUsers = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const roomUsers = await messageService.getChatRoomUsers(roomId);
    
    if (!roomUsers) {
      return res.status(404).json({ 
        success: false, 
        error: "채팅방을 찾을 수 없습니다." 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      users: roomUsers 
    });
  } catch (error) {
    console.error("채팅방 사용자 조회 오류:", error);
    res.status(500).json({ 
      success: false, 
      error: "채팅방 사용자 조회 실패" 
    });
  }
};

// 특정 사용자가 참여한 모든 채팅방 목록 조회
exports.getUserChatRooms = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 1. 사용자가 참여한 모든 채팅방 ID 목록 조회
    const roomIds = await messageService.getMessageRoomId(userId);
    
    if (!roomIds || roomIds.length === 0) {
      return res.status(200).json({ 
        success: true, 
        chatRooms: [] 
      });
    }
    
    // 2. 각 채팅방의 상세 정보 조회
    const chatRooms = await Promise.all(
      roomIds.map(async (roomId) => {
        const room = await ChatRoomsModel.findByPk(roomId, {
          attributes: ["id", "name", "is_group", "created_at"]
        });
        
        // 채팅방에 참여한 사용자 수 조회
        const userCount = await chat_room_users.count({
          where: { chat_room_id: roomId }
        });
        
        // 가장 최근 메시지 조회
        const lastMessage = await Message.findOne({
          where: { chat_room_id: roomId },
          order: [["sent_at", "DESC"]],
          limit: 1
        });
        
        return {
          ...room.toJSON(),
          userCount,
          lastMessage: lastMessage || null
        };
      })
    );
    
    res.status(200).json({ 
      success: true, 
      chatRooms 
    });
  } catch (error) {
    console.error("사용자 채팅방 목록 조회 오류:", error);
    res.status(500).json({ 
      success: false, 
      error: "사용자 채팅방 목록 조회 실패" 
    });
  }
};

// 채팅방 삭제
exports.deleteChatRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // 채팅방 존재 여부 확인
    const chatRoom = await ChatRoomsModel.findByPk(roomId);
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        error: "채팅방을 찾을 수 없습니다."
      });
    }

    // 채팅방 삭제 실행
    const isDeleted = await messageService.deleteChatRoom(roomId);
    
    if (isDeleted) {
      res.status(200).json({
        success: true,
        message: "채팅방이 성공적으로 삭제되었습니다."
      });
    } else {
      res.status(500).json({
        success: false,
        error: "채팅방 삭제에 실패했습니다."
      });
    }
  } catch (error) {
    console.error("채팅방 삭제 오류:", error);
    res.status(500).json({
      success: false,
      error: "채팅방 삭제 중 오류가 발생했습니다."
    });
  }
};
