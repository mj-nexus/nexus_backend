const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const { sequelize, Message, User, Profile } = require("./models"); // 필요한 모델 가져오기

// 프론트엔드 URL이 환경 변수에 없을 경우 기본값 사용
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
      origin: frontendUrl,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,                // true일 때는 origin을 *로 하면 안 됨
      allowedHeaders: ["Content-Type", "Authorization"]
    }
});

// 사용자 소켓 연결 정보 저장
const userSockets = new Map(); // userId -> socketId

// 소켓 통신 처리
io.on("connection", (socket) => {
    console.log("🔌 소켓 연결됨:", socket.id);

    // 사용자 인증 및 소켓 연결 정보 저장
    socket.on("authenticate", (userId) => {
        console.log(`👤 사용자 인증됨: ${userId}, 소켓: ${socket.id}`);
        
        // 사용자 ID 유효성 검사 (간단한 검증)
        if (!userId || isNaN(parseInt(userId))) {
            socket.emit('auth_error', { message: '유효하지 않은 사용자 ID입니다.' });
            return;
        }
        
        // 사용자 ID를 정수로 변환하여 저장
        const userIdInt = parseInt(userId);
        userSockets.set(userIdInt, socket.id);
        
        // 사용자 온라인 상태 업데이트
        User.update({ onlineStatus: true }, { where: { user_id: userIdInt } })
            .catch(err => console.error('사용자 상태 업데이트 실패:', err));
        
        // 인증 성공 응답
        socket.emit('authenticated', { success: true });
        
        // 해당 사용자에게 온 읽지 않은 알림이 있는지 확인하고 전송
        sendPendingNotifications(userIdInt);
    });

    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`🚪 ${socket.id} 님이 ${roomId}번 방에 입장`);
        io.to(roomId).emit("system", `${socket.id}가 입장했습니다.`);
    });

    socket.on("sendMessage", async (data) => {
        // data = { chat_room_id, sender_id, content, message_type }
        console.log("📨 수신 메시지:", data);

        try {
            // DB에 메시지 저장
            const savedMessage = await Message.create({
                chat_room_id: data.chat_room_id,
                sender_id: data.sender_id,
                content: data.content,
                message_type: data.message_type
            });

            // 저장된 메시지로 클라이언트들에게 전송
            io.to(data.chat_room_id).emit("receiveMessage", savedMessage);
            
            // 채팅방 참여자들에게 알림 전송
            sendMessageNotifications(data.chat_room_id, data.sender_id, savedMessage);
        } catch (error) {
            console.error("❌ 메시지 저장 실패:", error);
            socket.emit("errorMessage", { error: "메시지 저장 중 오류 발생" });
        }
    });

    socket.on("readMessages", async (data) => {
        // data = { user_id, chat_room_id, last_read_message_id }
        try {
            // 사용자의 lastReadMessageId 업데이트
            await User.update(
                { lastReadMessageId: data.last_read_message_id },
                { where: { user_id: data.user_id } }
            );
            
            // 해당 채팅방의 다른 사용자들에게 읽음 상태 알림
            socket.to(data.chat_room_id).emit("messageRead", {
                user_id: data.user_id,
                last_read_message_id: data.last_read_message_id
            });
        } catch (error) {
            console.error("❌ 메시지 읽음 상태 업데이트 실패:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ 연결 종료:", socket.id);
        
        // 연결이 종료된 사용자 찾기
        for (const [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                
                // 사용자 오프라인 상태 업데이트
                User.update({ onlineStatus: false }, { where: { user_id: userId } })
                    .catch(err => console.error('사용자 상태 업데이트 실패:', err));
                
                break;
            }
        }
    });
});

// 채팅방 참여자들에게 메시지 알림 전송
async function sendMessageNotifications(chatRoomId, senderId, message) {
    try {
        // 채팅방 참여자 조회
        const roomUsers = await sequelize.models.chat_room_users.findAll({
            where: { chat_room_id: chatRoomId }
        });
        
        // 발신자 정보 조회
        const sender = await Profile.findOne({
            where: { user_id: senderId }
        });
        
        const senderName = sender ? (sender.nick_name || sender.user_name) : '알 수 없음';
        
        // 각 참여자에게 알림 전송 (발신자 제외)
        for (const user of roomUsers) {
            if (user.user_id !== senderId) {
                const socketId = userSockets.get(user.user_id);
                
                // 알림 데이터 준비
                const notificationData = {
                    type: 'new_message',
                    sender_id: senderId,
                    sender_name: senderName,
                    chat_room_id: chatRoomId,
                    message_id: message.id,
                    content: message.content,
                    timestamp: message.createdAt || new Date()
                };
                
                if (socketId) {
                    // 온라인 상태라면 실시간 알림 전송
                    io.to(socketId).emit('notification', notificationData);
                }
                
                // 알림 테이블에 저장 (읽음 여부 추적을 위해)
                // 참고: 알림 테이블이 없다면 생성 필요
                try {
                    await sequelize.models.Notification.create({
                        user_id: user.user_id,
                        sender_id: senderId,
                        type: 'new_message',
                        content: message.content,
                        reference_id: message.id,
                        chat_room_id: chatRoomId,
                        is_read: false,
                        created_at: new Date()
                    });
                } catch (error) {
                    // Notification 모델이 없는 경우 오류가 발생할 수 있음
                    console.error('알림 저장 실패:', error);
                }
            }
        }
    } catch (error) {
        console.error('알림 전송 실패:', error);
    }
}

// 사용자에게 읽지 않은 알림 전송
async function sendPendingNotifications(userId) {
    try {
        // Notification 모델이 있다면 읽지 않은 알림 조회
        if (sequelize.models.Notification) {
            const pendingNotifications = await sequelize.models.Notification.findAll({
                where: {
                    user_id: userId,
                    is_read: false
                },
                order: [['created_at', 'DESC']],
                limit: 20
            });
            
            const socketId = userSockets.get(parseInt(userId));
            if (socketId && pendingNotifications.length > 0) {
                io.to(socketId).emit('pending_notifications', pendingNotifications);
            }
        }
    } catch (error) {
        console.error('읽지 않은 알림 조회 실패:', error);
    }
}

// 서버 시작
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
    .then(() => {
        server.listen(PORT, () => {
            console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ DB 연결 실패:", err);
    });
