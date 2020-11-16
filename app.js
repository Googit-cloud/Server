if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
require('./loaders/db')();

const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const http = require('http');

const app = express();
const port = '4000';
const server = http.createServer(app);
server.listen(port);
app.set('port', port);

const index = require('./routes/index');
const users = require('./routes/users');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/', index);
app.use('/users', users);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
