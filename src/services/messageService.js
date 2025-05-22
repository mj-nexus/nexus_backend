const { chat_room_users, chat_rooms, Message, User, ChatRoomsModel, Profile } = require("../models");

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
  const chatRoom = await ChatRoomsModel.findByPk(roomId, {
    attributes: ["id", "name", "is_group", "created_at"]
  });
  
  if (!chatRoom) {
    return null;
  }
  
  // 채팅방 참여 유저 ID 목록만 조회
  const roomUsers = await chat_room_users.findAll({
    where: { chat_room_id: roomId },
    attributes: ["user_id"]
  });
  
  // 유저 ID 목록 추출
  const userIds = roomUsers.map(user => user.user_id);
  
  // Profile 모델에서 사용자 정보 조회
  const profiles = userIds.length > 0 ? await Profile.findAll({
    where: { user_id: userIds },
    attributes: ['user_id', 'user_name', 'nick_name', 'profile_image', 'email']
  }) : [];
  
  // 최근 메시지 조회
  const lastMessage = await Message.findOne({
    where: { chat_room_id: roomId },
    order: [["sent_at", "DESC"]],
    limit: 1
  });
  
  return {
    ...chatRoom.toJSON(),
    users: profiles,
    userCount: profiles.length,
    lastMessage: lastMessage || null
  };
};

/**
 * 새로운 채팅방 생성
 */
exports.createChatRoom = async (data) => {
  const { name, is_group, user_ids } = data;
  
  // 트랜잭션 시작
  const transaction = await ChatRoomsModel.sequelize.transaction();
  
  try {
    // 1. 채팅방 생성
    const chatRoom = await ChatRoomsModel.create(
      {
        name: name,
        is_group: is_group
      },
      { transaction }
    );
    
    // 2. 채팅방에 사용자 추가
    const chatRoomUsers = await Promise.all(
      user_ids.map(user_id => 
        chat_room_users.create(
          {
            chat_room_id: chatRoom.id,
            user_id: user_id
          },
          { transaction }
        )
      )
    );
    
    // 트랜잭션 커밋
    await transaction.commit();
    
    return {
      chatRoom,
      chatRoomUsers
    };
    
  } catch (error) {
    // 에러 발생 시 트랜잭션 롤백
    await transaction.rollback();
    throw error;
  }
};

/**
 * 채팅방에 참여 중인 사용자 목록 조회
 */
exports.getChatRoomUsers = async (roomId) => {
  const roomUsers = await chat_room_users.findAll({
    where: { chat_room_id: roomId },
    attributes: ["user_id"]
  });
  
  // 유저 ID 목록 추출
  const userIds = roomUsers.map(user => user.user_id);
  
  // Profile 모델에서 사용자 정보 조회
  const profiles = userIds.length > 0 ? await Profile.findAll({
    where: { user_id: userIds },
    attributes: ['user_id', 'user_name', 'nick_name', 'profile_image', 'email']
  }) : [];
  
  return profiles;
};

// 채팅방 삭제
exports.deleteChatRoom = async (roomId) => {
  try {
    // 트랜잭션 시작
    const result = await ChatRoomsModel.sequelize.transaction(async (t) => {
      // 1. 채팅방의 모든 메시지 삭제
      await Message.destroy({
        where: { chat_room_id: roomId },
        transaction: t
      });

      // 2. 채팅방 사용자 관계 삭제
      await chat_room_users.destroy({
        where: { chat_room_id: roomId },
        transaction: t
      });

      // 3. 채팅방 삭제
      const deletedRoom = await ChatRoomsModel.destroy({
        where: { id: roomId },
        transaction: t
      });

      return deletedRoom;
    });

    return result > 0; // 삭제된 경우 true 반환
  } catch (error) {
    console.error('채팅방 삭제 중 오류:', error);
    throw error;
  }
};
