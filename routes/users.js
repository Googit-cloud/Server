const express = require('express');
const router = express.Router();
const { getCurrentUser } = require('./controllers/user.controller');

router.get('/current-user', getCurrentUser);

module.exports = router;
