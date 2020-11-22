const BranchSharingInfo = require('../models/BranchSharingInfo');

class BranchSharingInfoService {
  async createBranchSharingInfo(user_id, branch_id, has_writing_permission) {
    try {
      return await BranchSharingInfo.create({
        user_id, branch_id, has_writing_permission
      });
    } catch (err) {
      throw err;
    }
  }

  async validateDuplication(userId, branchId) {
    try {
      const allBranchSharingInfo = await BranchSharingInfo.find();
      console.log(userId, branchId, 'vali');
    } catch (err) {
      throw err;
    }
  }
}

module.exports = BranchSharingInfoService;
