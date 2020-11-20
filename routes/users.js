const express = require('express');
const router = express.Router();

const verifyToken = require('./middlewares/verifyToken');
const verifyClaimedUserId = require('./middlewares/verifyClaimedUserId');
const { getCurrentUser } = require('./controllers/user.controller');

const { createBranch, getBranches, createBranchSharingInfo } = require('./controllers/branch.controller');
const { createNote } = require('./controllers/note.controller');

router.get('/current-user', getCurrentUser);
router.post('/:user_id/branches/new', verifyToken, verifyClaimedUserId, createBranch);
router.post('/:user_id/branches/:branch_id/notes/new', verifyToken, verifyClaimedUserId, createNote);
router.get('/:user_id/branches', verifyToken, verifyClaimedUserId, getBranches);

router.post('/:user_id/branches/:branch_id/share', verifyToken, createBranchSharingInfo);


module.exports = router;
