const mongoose = require('mongoose');
const User = require('../../models/User');
const BranchSharingInfoService = require('../../services/branchSharingInfo.service');
const BranchService = require('../../services/branch.service');
const UserService = require('../../services/user.service');
const Branch = require('../../models/Branch');
const BranchSharingInfo = require('../../models/BranchSharingInfo');

exports.createBranch = async (req, res, next) => {
  console.log('createBranch!1')
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
    console.log(newBranch._id, 'createBranch!2')
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
    console.log(req.query, 'query')
    const userId = req.params.user_id;
    const { private, q } = req.query;
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);

    let myBranches, sharedBranches;

    if (q) {
      myBranches = await User.aggregate([
        { $match: { '_id': mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'branches',
            localField: 'my_branches',
            foreignField: '_id',
            as: 'branch'
          }
        },
        { $unwind: '$branch' },
        {
          $lookup: {
            from: 'notes',
            localField: 'branch.latest_note',
            foreignField: '_id',
            as: 'latest_note'
          }
        },
        { $unwind: '$latest_note' },
        {
          $match:
          {
            $or: [
              { 'latest_note.title': { $regex: '4', $options: 'g' } }, //`${q}`
              { 'latest_note.content': { $regex: '2', $options: 'g' } },//`${q}`
            ]
          }
        },
        { $project: { 'latest_note': true, 'branch': true, email: true } },
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
            as: 'branch'
          }
        },
        { $unwind: '$branch' },
        {
          $lookup: {
            from: 'notes',
            localField: 'branch.latest_note',
            foreignField: '_id',
            as: 'latest_note'
          }
        },
        { $unwind: '$latest_note' },
        {
          $match:
          {
            $or: [
              { 'latest_note.title': { $regex: '5', $options: 'g' } },//`${q}`
              { 'latest_note.content': { $regex: '2', $options: 'g' } },//`${q}`
            ]
          }
        },                  // 공유받은 경우엔 본인 이메일말고 공유해준사람 이메일 넣기
        { $project: { 'latest_note': true, 'branch': true, email: true } },
      ]);
    } else {
      myBranches = await User.aggregate([
        { $match: { '_id': mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'branches',
            localField: 'my_branches',
            foreignField: '_id',
            as: 'branch'
          }
        },
        { $unwind: '$branch' },
        {
          $lookup: {
            from: 'notes',
            localField: 'branch.latest_note',
            foreignField: '_id',
            as: 'latest_note'
          }
        },
        { $unwind: '$latest_note' },
        { $project: { 'latest_note': true, 'branch': true, email: true } },
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
            as: 'branch'
          }
        },
        { $unwind: '$branch' },
        {
          $lookup: {
            from: 'notes',
            localField: 'branch.latest_note',
            foreignField: '_id',
            as: 'latest_note'
          }
        },
        { $unwind: '$latest_note' },    // 공유받은 경우엔 본인 이메일말고 공유해준사람 이메일 넣기
        { $project: { 'latest_note': true, 'branch': true, email: true } },
      ]);
    }

    const accessibleNoteList = [...myBranches, ...sharedBranches];
    accessibleNoteList.sort((a, b) => {
      const left = a.latest_note.updated_at.toISOString();
      const right = b.latest_note.updated_at.toISOString();
      if (left < right) return 1;
      else if (left === right) return 0;
      else return -1;
    });

    if (skip > accessibleNoteList.length - 1) {
      return res.status(200).json({
        result: 'ok',
        message: '더 이상의 노트는 없습니다.'
      });
    }
    
    const limited = accessibleNoteList.splice(`${skip}`, `${limit}`)
    res.status(200).json({
      result: 'ok',
      data: limited
    });
  } catch (err) {
    next(err);
  }
};

exports.createBranchSharingInfo = async (req, res, next) => {
  try {
    const userService = new UserService();
    const branchSharingInfoService = new BranchSharingInfoService();
    const branchService = new Branch();

    const branchId = mongoose.Types.ObjectId(req.params.branch_id);
    const auth = req.body.sharingInfo.auth;
    const email = 'xiaoli150510@gmail.com';
    const hasPermission = (auth === 'write');

    const [ validation ] = await User.aggregate([
      { $match: { 'email': email }},
      {
        $lookup: {
          from: 'branchsharinginfos',
          localField: 'shared_branches_info',
          foreignField: '_id',
          as: 'sharingInfoList'
        }
      },
      { $unwind: '$sharingInfoList'},
      { $match: {'sharingInfoList.branch_id': branchId }}
    ]);

    if (validation) {
      return res.json({
        result: 'failure',
        message: 'already shared user'
      })
    }

    const user = await userService.getUserByEmail(email);
    const branchSharingInfo = await branchSharingInfoService.createBranchSharingInfo(
      user._id, branchId, hasPermission
    );

    user.shared_branches_info.push(branchSharingInfo._id);
    const updatedUser
      = await userService
        .getUserByMongooseIdAndUpdate(user_id, user);

    const branch = await branchService.getBranchByMongooseId(branchId);
    branch.shared_users_info.push(user._id)
    const updatedBranch
      = await branchService
        .getBranchByMongooseIdAndUpdate(branchId, branch)

    return res.json({
      result: 'ok',
    })
  } catch (err) {
    next(err);
  }
};

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
