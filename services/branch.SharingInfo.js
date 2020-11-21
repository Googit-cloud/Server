const BranchSharingInfo = require('../models/BranchSharingInfo');

class BranchSharingInfoService {
  async createBranchSharingInfo(user_id) {
    try {
      return await BranchSharingInfo.create({
        created_by: user_id,
        notes: [],
        shared_users_info: [],
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
