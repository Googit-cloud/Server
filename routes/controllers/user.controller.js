const UserService = require('../../services/user.service');
const BranchService = require('../../services/branch.service');
const BranchSharingInfoService = require('../../services/branchSharingInfo.service');
const jwt = require('jsonwebtoken');

exports.getCurrentUser = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    );

    const user
      = await new UserService()
        .getUserByMongooseId(decoded._id);

    res.status(200).json({
      result: 'ok',
      user,
    });
  } catch (err) {
    res.status(400).json({
      result: 'failure',
      message: 'bad request'
    });
  }
};

exports.getAuthor = async (req, res, next) => {
  try {
    const author
      = await new UserService()
        .getUserByMongooseId(req.params.author_id);

    res.status(200).json({
      result: 'ok',
      author,
    });
  } catch (err) {
    next(err);
  }

};

exports.getSharedUser = async (req, res, next) => {
  try {
    const branchId = req.params.branch_id;
    const branchService = new BranchService();
    const userService = new UserService();
    const branchSharingInfoService = new BranchSharingInfoService();

    const branchSharingInfoIds = await branchService.getAllBranchSharingInfo(branchId);

    if (!branchSharingInfoIds.length) {
      return res.status(200).json({
        result: 'not exist',
        message: '현재 노트를 공유하고 있는 유저가 없습니다.'
      });
    }

    const branchSharingInfos = await Promise.all(
      branchSharingInfoIds.map((id) => (
        branchSharingInfoService.getBranchSharingInfoByMongooseId(id)
      ))
    );

    const sharedUsers = await Promise.all(
      branchSharingInfos.map((info) => (
        userService.getUserByMongooseId(info.user_id)
      ))
    );

    const sharedUserEmails = sharedUsers.map(user => (user.email));

    if (!sharedUserEmails.length) {
      return res.status(200).json({
        result: 'not exist',
        message: '현재 노트를 공유하고 있는 유저가 없습니다.'
      });
    }

    return res.status(200).json({
      result: 'ok',
      sharedUserEmails,
    });
  } catch (err) {
    next(err);
  }
};
