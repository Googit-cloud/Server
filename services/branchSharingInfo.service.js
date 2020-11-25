const BranchSharingInfo = require('../models/BranchSharingInfo');
const UserService = require('./user.service');

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

  async getBranchSharingInfoByMongooseId(id) {
    try {
      return await BranchSharingInfo.findById(id);
    } catch (err) {
      throw err;
    }
  }

  async validateDuplication(currentBranch, email) {
    try {
      const userService = new UserService();

      if (!currentBranch.shared_users_info.length) return false;

      const currentBranchSharingInfo = await Promise.all(
        currentBranch.shared_users_info.map((id) => (
          this.getBranchSharingInfoByMongooseId(id)
        ))
      );

      const sharedUsers = await Promise.all(
        currentBranchSharingInfo.map((branchSharingInfo) => (
          userService.getUserByMongooseId(branchSharingInfo.user_id)
        ))
      );

      const alreadySharedUser = sharedUsers.filter((user) => (user.email === email));
      if (!alreadySharedUser.length) return false;

      return true;
    } catch (err) {
      throw err;
    }
  }

  async deleteBranchSharingInfo(id) {
    try {
      await BranchSharingInfo.findByIdAndDelete(id);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = BranchSharingInfoService;
