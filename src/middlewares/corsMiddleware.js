const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// 여러 도메인을 배열로 변환
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(',').map(url => url.trim())
  : ["http://localhost:3000"]; // 기본값

const corsMiddleware = cors({
  origin: function (origin, callback) {
    // origin이 undefined인 경우도 허용 (예: 서버 간 통신)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS 정책에 의해 차단된 origin: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
});

module.exports = corsMiddleware;
