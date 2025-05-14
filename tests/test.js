// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
    console.log('클라이언트 연결됨');
    ws.on('message', msg => console.log('받음:', msg));
});

server.listen(5003, () => {
    console.log('서버 실행 중: http://localhost:5003');
});
