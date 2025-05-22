const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// 프론트엔드 URL이 환경 변수에 없을 경우 기본값 사용
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

const corsMiddleware = cors({
    origin: frontendUrl, // 하드코딩 또는 환경 변수 사용
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // PATCH 반드시 포함!
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'] // * 절대 쓰지 말고 명시적으로!
});

module.exports = corsMiddleware;