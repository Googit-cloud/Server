if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
require('./loaders/db')();

const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http');

const app = express();
const port = '4000';
const server = http.createServer(app);
const socket = require('./socket');
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});
socket(io);

const index = require('./routes/index');
const users = require('./routes/users');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/', index);
app.use('/users', users);

app.use((req, res, next) => {
  next(createError(404, '페이지를 찾을 수 없어요'));
});

app.use((err, req, res, next) => {
  console.error(err);

  const message
    = err.statusCode === 404
      ? err.message
      : '서버에 문제가 생겼어요';

  res
    .status(err.statusCode || 500)
    .json({
      result: 'failure',
      message,
    });
});

server.listen(port);

module.exports = app;
