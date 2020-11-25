const express = require('express');
const router = express.Router();

const verifyToken = require('./middlewares/verifyToken');
const verifyClaimedUserId = require('./middlewares/verifyClaimedUserId');
const { getCurrentUser, getAuthor, getSharedUser } = require('./controllers/user.controller');
const {
  createBranch,
  getBranches,
  createBranchSharingInfo,
  getBranch,
  getPrivateBranches,
  deleteBranch,
} = require('./controllers/branch.controller');
const { createNote, getNote } = require('./controllers/note.controller');
const { getBranchSharingInfo } = require('./controllers/branchSharingInfo.controller');

router.get('/current-user', getCurrentUser);

router.get(
  '/:user_id/branch-sharing-infos/:branch-sharing-info_id',
  verifyToken,
  verifyClaimedUserId,
  getBranchSharingInfo
);

router.get(
  '/:user_id/users/:author_id',
  verifyToken,
  verifyClaimedUserId,
  getAuthor
);

router.post(
  '/:user_id/branches/new',
  verifyToken,
  verifyClaimedUserId,
  createBranch
);

router.post(
  '/:user_id/branches/:branch_id/notes/new',
  verifyToken,
  verifyClaimedUserId,
  createNote
);

router.get(
  '/:user_id/branches',
  verifyToken,
  verifyClaimedUserId,
  getBranches
);

router.get(
  '/:user_id/branches/private',
  verifyToken,
  verifyClaimedUserId,
  getPrivateBranches
);

router.get(
  '/:user_id/notes/:note_id',
  verifyToken,
  verifyClaimedUserId,
  getNote
);

router.get(
  '/:user_id/branches/:branch_id/share/users',
  verifyToken,
  verifyClaimedUserId,
  getSharedUser
);

router.post(
  '/:user_id/branches/:branch_id/share/new',
  verifyToken,
  verifyClaimedUserId,
  createBranchSharingInfo
);

router.get(
  '/:user_id/branches/:branch_id',
  verifyToken,
  verifyClaimedUserId,
  getBranch
);

router.delete(
  '/:user_id/branches/:branch_id',
  verifyToken,
  verifyClaimedUserId,
  deleteBranch
);

module.exports = router;
