// config/socket.js
module.exports = (server) => {
    const { Server } = require("socket.io");
    const io = new Server(server, {
        cors: { origin: "*" }
    });

    // 소켓 통신 설정
    io.on("connection", (socket) => {
        console.log("✅ 소켓 연결:", socket.id);

        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
            console.log(`${socket.id} 님이 ${roomId} 방에 입장`);
        });

        socket.on("sendMessage", (data) => {
            io.to(data.chat_room_id).emit("receiveMessage", data);
        });

        socket.on("disconnect", () => {
            console.log("❌ 연결 해제:", socket.id);
        });
    });
};
