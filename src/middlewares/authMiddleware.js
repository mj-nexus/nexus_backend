const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");  // 헤더에서 JWT 토큰 가져오기

    if (!token) {
        return res.status(401).json({ message: "인증 실패: 토큰 없음" });
    }

    // Authorization: Bearer <token> 형식일 때
    const bearerToken = token.split(" ")[1];  // Bearer 토큰만 추출

    if (!bearerToken) {
        return res.status(401).json({ message: "토큰이 필요합니다." });
    }

    try {
        const decoded = jwt.verify(bearerToken, process.env.JWT_ACCESS_SECRET); // JWT_SECRET을 accessToken의 비밀 키로 수정
        req.user = decoded;  // 요청 객체에 사용자 정보 추가
        next();
    } catch (error) {
        res.status(401).json({ message: "토큰이 유효하지 않습니다." });
    }
};

module.exports = authMiddleware;
