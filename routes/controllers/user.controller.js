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

    const branchSharingInfos = await Promise.all(
      branchSharingInfoIds.map((id) => (
        branchSharingInfoService.getBranchSharingInfoByMongooseId(id)
      ))
    );

    const sharedUserInfoWithPermission = await Promise.all(
      branchSharingInfos.map(async (info) => {
        const sharedUser = await userService.getUserByMongooseId(info.user_id);
        return {
          permission: info.has_writing_permission ? 'write' : 'read only',
          sharedUser
        };
      })
    );

    return res.status(200).json({
      result: 'ok',
      data: sharedUserInfoWithPermission,
    });
  } catch (err) {
    next(err);
  }
};
