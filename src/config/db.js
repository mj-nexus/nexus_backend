require("dotenv").config(); // .env 파일 자동 로드
const { Sequelize } = require("sequelize");

// Sequelize 인스턴스 생성
const sequelize = new Sequelize(
  process.env.DB_NAME,    // 데이터베이스 이름
  process.env.DB_USER,    // DB 사용자
  process.env.DB_PASS,    // DB 비밀번호
  {
    host: process.env.DB_HOST, // 데이터베이스 호스트 (예: localhost)
    port: process.env.DB_PORT,  // 데이터베이스 포트 (기본값: 3306)
    dialect: "mariadb",          // MariaDB 사용
    logging: false,              // 콘솔에 SQL 쿼리 출력 방지 (개발 시 true 가능)
    define: {
      timestamps: false,         // createdAt, updatedAt 자동 생성 방지
      underscored: true          // camelCase 대신 snake_case로 컬럼명 변환
    }
  }
);

// 데이터베이스 연결 확인
sequelize.authenticate()
  .then(() => console.log("✅ MariaDB 연결 성공!"))
  .catch(err => console.error("❌ MariaDB 연결 실패:", err));
sequelize.sync({ force: false })
    .then(() => {
        console.log('Database & tables created!');
    })
    .catch(err => {
        console.error('Unable to create table:', err);
    });
module.exports = sequelize;
