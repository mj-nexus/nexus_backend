const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const { sequelize, Message } = require("./models"); // Message 모델 가져오기

// 여러 도메인을 쉼표로 구분해서 환경변수에서 가져오기
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(',').map(url => url.trim())
  : ["http://localhost:3000"];

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ 허용되지 않은 Origin:", origin);
        callback(new Error("CORS 차단: 허용되지 않은 origin"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
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
    console.log("📨 수신 메시지:", data);

    try {
      const savedMessage = await Message.create({
        chat_room_id: data.chat_room_id,
        sender_id: data.sender_id,
        content: data.content,
        message_type: data.message_type
      });

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

sequelize.sync({ alter: false })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB 연결 실패:", err);
  });
