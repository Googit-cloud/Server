const express = require('express');
const router = express.Router();
const verifyToken = require('./middlewares/verifyToken');
const { getCurrentUser } = require('./controllers/user.controller');
const { createBranch } = require('./controllers/branch.controller');
const { createNote } = require('./controllers/note.controller');

router.get('/current-user', getCurrentUser);
router.post('/:user_id/branches/new', verifyToken, createBranch);
router.post('/:user_id/notes/new', verifyToken, createNote);

module.exports = router;
