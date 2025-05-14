const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const boardRoutes = require('./routes/boardRoutes');
const messageRoutes = require('./routes/messageRoutes');
const errorHandler = require('./middlewares/errorHandler');
const corsMiddleware = require("./middlewares/corsMiddleware");
const logger = require("./middlewares/logger");
const { sequelize } = require("./models");
const path = require('path');


app.use(corsMiddleware);
app.use(express.json());
app.use(logger);
app.use(errorHandler);

app.use('/upload', express.static(path.join(__dirname, 'uploads')))

app.use('/api/user', userRoutes);
app.use('/board', boardRoutes);
app.use('/api/messages', messageRoutes);

sequelize.sync()
    .then(() => {
        console.log('Database connected');
    })
    .catch(err => {
        console.log('Unable to connect to the database:', err)
    })

module.exports = app;