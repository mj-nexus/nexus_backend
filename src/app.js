const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorHandler');
const corsMiddleware = require("./middlewares/corsMiddleware");
const logger = require("./middlewares/logger");

app.use(express.json());
app.use(corsMiddleware);
app.use(logger);
app.use(errorHandler);

app.use('/api/user', userRoutes);

module.exports = app;