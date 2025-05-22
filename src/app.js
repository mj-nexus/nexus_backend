const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const boardRoutes = require('./routes/boardRoutes');
const messageRoutes = require('./routes/messageRoutes');
const mjcNoticeRoutes = require('./routes/mjcNoticeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const errorHandler = require('./middlewares/errorHandler');
const corsMiddleware = require("./middlewares/corsMiddleware");
const logger = require("./middlewares/logger");
const path = require('path');
const cronService = require('./services/cronService');
const seniorBoardRoutes = require('./routes/seniorBoardRoutes');

// CORS 미들웨어를 가장 먼저 적용
app.use(corsMiddleware);
app.options("*", corsMiddleware); // preflight 요청을 명확히 처리


// 다른 미들웨어 및 라우터 설정
app.use(express.json());
app.use(logger);
app.use(errorHandler);

app.use('/upload', express.static(path.join(__dirname, 'uploads')));

app.use('/api/user', userRoutes);
app.use('/board', boardRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/mjc-notices', mjcNoticeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/senior-board', seniorBoardRoutes);

// 크론 작업 초기화
cronService.initCronJobs();

module.exports = app;