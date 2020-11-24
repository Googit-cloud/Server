const BranchSharingInfoService = require('../../services/branchSharingInfo.service');

exports.getBranchSharingInfo = async (req, res, next) => {
  const branchSharingInfoId = req.params['branch-sharing-info_id'];

  try {
    const branchSharingInfo
      = await new BranchService()
        .getBranchSharingInfoByMongooseId(branchSharingInfoId);

    if (!branchSharingInfo) {
      res.status(400).json({
        result: 'failure',
        message: '잘못된 요청입니다'
      });
    }

    res.status(200).json({
      result: 'ok',
      branchSharingInfo
    });
  } catch (err) {
    next(err);
  }
};
