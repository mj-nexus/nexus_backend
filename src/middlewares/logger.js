const morgan = require("morgan");

const logger = morgan("dev");  // 개발용 로그 포맷

module.exports = logger;
