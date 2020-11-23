const mongoose = require('mongoose');
const User = require('../../models/User');
const BranchSharingInfoService = require('../../services/branchSharingInfo.service');
const BranchService = require('../../services/branch.service');
const UserService = require('../../services/user.service');
const Branch = require('../../models/Branch');
const BranchSharingInfo = require('../../models/BranchSharingInfo');

exports.createBranch = async (req, res, next) => {
  const { user_id } = req.params;
  const userBranch = new UserService();
  const branchService = new BranchService();

  try {
    const newBranch = await branchService.createBranch(user_id);
    const user = await userBranch.getUserByMongooseId(user_id);

    user.my_branches.push(newBranch._id);

    const updatedUser
      = await new UserService()
        .getUserByMongooseIdAndUpdate(user_id, user);

    res.status(201).json({
      result: 'ok',
      newBranch,
      updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

exports.getBranches = async (req, res, next) => {
  try {
    const userService = new UserService();
    const userId = req.params.user_id;
    
    const currentUser = await userService.getUserByMongooseId(userId);
    console.log(currentUser, 'branchList')

  } catch (err) {
    next(err);
  }
}

exports.createBranchSharingInfo = async (req, res, next) => {
  try {
    const userService = new UserService();
    const branchSharingInfoService = new BranchSharingInfoService();
    const branchService = new BranchService();

    const branchId = req.params.branch_id;
    const permission = req.body.sharingInfo.permission;
    const email = req.body.sharingInfo.email;
    const hasPermission = (permission === 'write');

    const sharedUser = await userService.getUserByEmail(email);
    const currentBranch = await branchService.getBranchByMongooseId(branchId);

    const isAuthor = await branchSharingInfoService.validateAuthor(currentBranch , email);

    if (isAuthor) {
      return res.json({
        result: 'validation err',
        message: '작성자에게 공유할 수 없습니다.'
      });
    }

    const hasAlreadyShared = await branchSharingInfoService.validateDuplication(currentBranch , email);

    if (hasAlreadyShared) {
      return res.json({
        result: 'validation err',
        message: '이미 공유된 유저입니다.'
      });
    }

    const branchSharingInfo = await branchSharingInfoService.createBranchSharingInfo(
      sharedUser._id, branchId, hasPermission
    );

    currentBranch.shared_users_info.push(branchSharingInfo._id);
    await branchService.getBranchByMongooseIdAndUpdate(branchId, currentBranch);

    sharedUser.shared_branches_info.push(branchSharingInfo._id);
    await userService.getUserByMongooseIdAndUpdate(sharedUser._id, sharedUser);

    return res.json({
      result: 'ok',
    })
  } catch (err) {
    next(err);
  }
};

exports.getPrivateBranches = async (req, res, next) => {
  console.log('private')
}



exports.getBranch = async (req, res, next) => {
  const { branch_id } = req.params;

  try {
    const branch
      = await new BranchService().getBranchByMongooseId(branch_id);

    if (!branch) {
      res.status(400).json({
        result: 'failure',
        message: '브랜치가 없습니다',
      });
    }

    res.status(200).json({
      result: 'ok',
      branch,
    });
  } catch (err) {
    next(err);
  }
};
