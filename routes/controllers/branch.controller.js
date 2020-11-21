const mongoose = require('mongoose');
const User = require('../../models/User');
const BranchService = require('../../services/branch.service');
const UserService = require('../../services/user.service');

const BranchSharingInfoService = require('../../services/branch.SharingInfo');
const Branch = require('../../models/Branch');
const BranchSharingInfo = require('../../models/BranchSharingInfo');
const Note = require('../../models/Note');

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
      branchId: newBranch._id,
      updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

exports.getBranches = async (req, res, next) => {
  try {
    const { skip, limit, private, q } = req.query;
    const userId = req.params.user_id;
    let myBranches, sharedBranches;

    if (q) {
      //my branch를 훑는 법
      myBranches = await User.aggregate([
        { $match: { '_id': mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'branches',
            localField: 'my_branches',
            foreignField: '_id',
            as: 'branchWrittenBycurrentUser'
          }
        },
        {
          $lookup: {
            from: 'notes',
            localField: 'branchWrittenBycurrentUser.latestNote',
            foreignField: '_id',
            as: 'noteList'
          }
        },
        { $project: { 'noteList': true } },
        { $unwind: '$noteList' },
        {
          $match:
          {
            $or: [
              { 'noteList.title': { $regex: '4', $options: 'g' } }, //`${q}`
              { 'noteList.content': { $regex: '2', $options: 'g' } },//`${q}`
            ]
          }
        },
      ]);

      //shared iterate
      sharedBranches = await User.aggregate([
        { $match: { '_id': mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'branchsharinginfos',
            localField: 'shared_branches_info',
            foreignField: '_id',
            as: 'sharingInfoOfcurrentUser'
          }
        },
        {
          $lookup: {
            from: 'branches',
            localField: 'sharingInfoOfcurrentUser.branch_id',
            foreignField: '_id',
            as: 'branchSharedToCurrentUser'
          }
        },
        {
          $lookup: {
            from: 'branches',
            localField: 'sharingInfoOfcurrentUser.branch_id',
            foreignField: '_id',
            as: 'branchSharedToCurrentUser'
          }
        },
        {
          $lookup: {
            from: 'notes',
            localField: 'branchSharedToCurrentUser.latestNote',
            foreignField: '_id',
            as: 'noteList'
          }
        },
        { $project: { 'noteList': true } },
        { $unwind: '$noteList' },
        {
          $match:
          {
            $or: [
              { 'noteList.title': { $regex: '5', $options: 'g' } },//`${q}`
              { 'noteList.content': { $regex: '2', $options: 'g' } },//`${q}`
            ]
          }
        },
      ]);
    } else {
      myBranches = await User.aggregate([
        { $match: { '_id': mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'branches',
            localField: 'my_branches',
            foreignField: '_id',
            as: 'branchWrittenBycurrentUser'
          }
        },
        {
          $lookup: {
            from: 'notes',
            localField: 'branchWrittenBycurrentUser.latestNote',
            foreignField: '_id',
            as: 'noteList'
          }
        },
        { $project: { 'noteList': true } },
        { $unwind: '$noteList' },
      ]);

      //shared iterate
      sharedBranches = await User.aggregate([
        { $match: { '_id': mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'branchsharinginfos',
            localField: 'shared_branches_info',
            foreignField: '_id',
            as: 'sharingInfoOfcurrentUser'
          }
        },
        {
          $lookup: {
            from: 'branches',
            localField: 'sharingInfoOfcurrentUser.branch_id',
            foreignField: '_id',
            as: 'branchSharedToCurrentUser'
          }
        },
        {
          $lookup: {
            from: 'branches',
            localField: 'sharingInfoOfcurrentUser.branch_id',
            foreignField: '_id',
            as: 'branchSharedToCurrentUser'
          }
        },
        {
          $lookup: {
            from: 'notes',
            localField: 'branchSharedToCurrentUser.latestNote',
            foreignField: '_id',
            as: 'noteList'
          }
        },
        { $project: { 'noteList': true } },
        { $unwind: '$noteList' },
      ]);
    }

    const accessibleNoteList = [...myBranches, ...sharedBranches];
    accessibleNoteList.sort((a, b) => {
      let left, right;
      if (left > right) return 1;
      else if (left === right) return 0;
      else return -1;
    });

    res.status(200).json({
      result: 'ok',
      data: accessibleNoteList
    });
  } catch (err) {
    next(err);
  }
};

exports.createBranchSharingInfo = async function(req, res, next) {
  console.log(req.params, 'hi');
  try {
    // const { email, auth } = req.body.sharingInfo;
    const branchId = req.params.branch_id;
    const auth = req.body.sharingInfo.auth;
    const email = 'xiaoli150510@gmail.com';
    const hasPermission = (auth === 'write');
    const user = await new UserService().getUserByEmail(email);

    const validation = await new BranchSharingInfoService().validateDuplication(branchId, user._id);

    const branchSharingInfo = await BranchSharingInfo.create({
      'user_id': user._id,
      'branch_id': branchId,
      'has_writing_permission': hasPermission
    });

    user.shared_branches_info.push(branchSharingInfo._id);
    await user.save();

    // console.log(branchSharingInfo, 'info');
  } catch (err) {
    next(err);
  }

};
