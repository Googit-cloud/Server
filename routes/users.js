const express = require('express');
const router = express.Router();

const verifyToken = require('./middlewares/verifyToken');
const { getCurrentUser } = require('./controllers/user.controller');
const { createBranch, unShiftNoteToBranch } = require('./controllers/branch.controller');
const { createNote } = require('./controllers/note.controller');

router.get('/current-user', getCurrentUser);
router.post('/:user_id/branches/new', verifyToken, createBranch);
router.post('/:user_id/notes/new', createNote);
router.patch('/:user_id/branches/:branch_id/notes/:note_id', unShiftNoteToBranch);

module.exports = router;
