const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const { sequelize, Message } = require("./models"); // Message 모델 가져오기

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 소켓 통신 처리
io.on("connection", (socket) => {
    console.log("🔌 소켓 연결됨:", socket.id);

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
        } catch (error) {
            console.error("❌ 메시지 저장 실패:", error);
            socket.emit("errorMessage", { error: "메시지 저장 중 오류 발생" });
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ 연결 종료:", socket.id);
    });
});

// 서버 시작
const PORT = process.env.PORT || 5000;

sequelize.sync()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ DB 연결 실패:", err);
    });
