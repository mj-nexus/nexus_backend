const WebSocket = require('ws');
const socket = new WebSocket("ws://localhost:5003");
socket.send("hello");
