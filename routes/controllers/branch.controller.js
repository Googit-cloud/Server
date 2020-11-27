const UserService = require('../../services/user.service');
const NoteService = require('../../services/note.service');
const BranchService = require('../../services/branch.service');
const BranchSharingInfoService = require('../../services/branchSharingInfo.service');
const { responseResults } = require('../../constants');

const userService = new UserService();
const noteService = new NoteService();
const branchService = new BranchService();
const branchSharingInfoService = new BranchSharingInfoService();

exports.createBranch = async (req, res, next) => {
  const { user_id } = req.params;

  try {
    const newBranch = await branchService.createBranch(user_id);
    const user = await userService.getUserByMongooseId(user_id);

    user.my_branches.push(newBranch._id);

    const updatedUser
      = await userService
        .getUserByMongooseIdAndUpdate(user_id, user);

    res.status(201).json({
      result: responseResults.OK,
      newBranch,
      updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

function filterByKeyword(branchesWithNote, keyword) {
  const textContentsByBranchId = {};

  branchesWithNote.map(branch => {
    textContentsByBranchId[branch.branch._id] = [];

    branch.latestNote.blocks.forEach(block => {
      if (!block.children[0].text) return;

      textContentsByBranchId[branch.branch._id]
        .push(block.children[0].text);
    });
  });

  const searchedBrancheId = {};
  const regex = new RegExp(`${keyword}`, 'i');

  for (const key in textContentsByBranchId) {
    textContentsByBranchId[key].forEach(cur => {
      if (!regex.exec(cur)) return;

      searchedBrancheId[key] = true;
    });
  }

  const searchedBranches
    = branchesWithNote.filter(branch => (
      searchedBrancheId[branch.branch._id]
    ));

  return searchedBranches;
}

exports.getBranches = async (req, res, next) => {
  try {
    const keyword = req.query.q;
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    const { user_id } = req.params;
    const currentUser = await userService.getUserByMongooseId(user_id);

    const myBranches = await Promise.all(
      currentUser.my_branches.map(branchId => {
        return branchService.getBranchByMongooseId(branchId);
      })
    );
    console.log(currentUser);
    const sharedBranchesInfos = await Promise.all(
      currentUser.shared_branches_infos.map(branchSharingInfoId => {
        return branchSharingInfoService
          .getBranchSharingInfoByMongooseId(branchSharingInfoId);
      })
    );

    const sharedBranches = await Promise.all(
      sharedBranchesInfos.map(sharedBranchInfo => {
        return branchService
          .getBranchByMongooseId(sharedBranchInfo.branch_id);
      })
    );

    const allBranches = [...myBranches, ...sharedBranches];

    const branchesCombinedWithNote = await Promise.all(
      allBranches.map(async branch => {
        const latestNote
          = await noteService.getNoteByMongooseId(branch.latest_note);

        return {
          branch,
          latestNote,
        };
      })
    );

    const keywordSearchedBranches
      = keyword
        ? filterByKeyword(branchesCombinedWithNote, keyword)
        : branchesCombinedWithNote;

    keywordSearchedBranches.sort((a, b) => {
      const left = a.latestNote.updated_at;
      const right = b.latestNote.updated_at;

      if (left < right) return 1;
      if (left === right) return 0;
      return -1;
    });

    if (skip > keywordSearchedBranches.length - 1) {
      return res.status(200).json({
        result: responseResults.NO_MORE_BRANCHES,
        message: '쪽지를 모두 불러왔습니다',
      });
    }

    const limitedList
      = [...keywordSearchedBranches]
        .splice(`${skip}`, `${limit + skip}`);

    const listWithEmail = await Promise.all(
      limitedList.map(async branch => {
        const user
          = await userService
            .getUserByMongooseId(branch.latestNote.created_by);

        return {
          email: user.email,
          branch,
        };
      })
    );

    res.status(200).json({
      result: responseResults.OK,
      data: listWithEmail
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.getPrivateBranches = async (req, res, next) => {
  try {
    const keyword = req.query.q;
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    const { user_id } = req.params;
    const currentUser = await userService.getUserByMongooseId(user_id);

    const myBranches = await Promise.all(
      currentUser.my_branches.map(branchId => {
        return branchService.getBranchByMongooseId(branchId);
      })
    );

    const unSharedBranches = await Promise.all(
      myBranches.filter(branch => !branch.sharing_infos.length)
    );

    const latestNoteInfo = await Promise.all(
      unSharedBranches.map(async branch => {
        const latestNote
          = await noteService.getNoteByMongooseId(branch.latest_note);

        return {
          branch,
          latestNote,
        };
      })
    );

    const keywordSearchedBranches
      = keyword
        ? filterByKeyword(latestNoteInfo, keyword)
        : latestNoteInfo;

    keywordSearchedBranches.sort((a, b) => {
      const left = a.latestNote.updated_at;
      const right = b.latestNote.updated_at;

      if (left < right) return 1;
      if (left === right) return 0;
      return -1;
    });

    const limitedList
      = [...keywordSearchedBranches]
        .splice(`${skip}`, `${limit + skip}`);

    const listWithEmail = await Promise.all(
      limitedList.map(async branch => {
        const user
          = await userService
            .getUserByMongooseId(branch.latestNote.created_by);

        return {
          email: user.email,
          branch,
        };
      })
    );

    res.status(200).json({
      result: responseResults.OK,
      data: listWithEmail
    });
  } catch (err) {
    next(err);
  }

};

exports.getBranch = async (req, res, next) => {
  const { branch_id } = req.params;

  try {
    const branch
      = await branchService.getBranchByMongooseId(branch_id);

    if (!branch) {
      res.status(400).json({
        result: responseResults.FAILURE,
        message: '브랜치가 없습니다',
      });
    }

    res.status(200).json({
      result: responseResults.OK,
      branch,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteBranch = async (req, res, next) => {
  const { branch_id } = req.params;

  try {
    const branch
      = await branchService.getBranchByMongooseId(branch_id);

    const sharedUserInfoIds = branch.sharing_infos;

    for (let i = 0; i < sharedUserInfoIds.length; i++) {
      const sharedUserInfoId = sharedUserInfoIds[i];

      const sharedUserInfo
        = await branchSharingInfoService
          .getBranchSharingInfoByMongooseId(sharedUserInfoId);

      const sharedUser
        = await userService
          .getUserByMongooseId(sharedUserInfo.user_id);

      const sharedBranchInfoIds = sharedUser.shared_branches_infos;
      const sharedBranchInfoIdIndex
        = sharedBranchInfoIds.indexOf(sharedUserInfoId);

      sharedBranchInfoIds.splice(sharedBranchInfoIdIndex, 1);

      await userService
        .getUserByMongooseIdAndUpdate(sharedUser._id, sharedUser);

      await branchSharingInfoService
        .deleteBranchSharingInfo(sharedUserInfoId);
    }

    for (let i = 0; i < branch.notes_history.length; i++) {
      const noteId = branch.notes_history[i];
      await noteService.deleteNote(noteId);
    }

    await noteService.deleteNote(branch.latest_note);

    const branchCreator
      = await userService
        .getUserByMongooseId(branch.created_by);

    const branchIdIndex
      = branchCreator.my_branches.indexOf(branch_id);

    branchCreator.my_branches.splice(branchIdIndex, 1);

    await userService
      .getUserByMongooseIdAndUpdate(branchCreator._id, branchCreator);

    await branchService.deleteBranch(branch_id);

    res.status(202).json({
      result: responseResults.OK,
      updatedUser: branchCreator,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
