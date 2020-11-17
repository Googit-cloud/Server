const User = require('../models/User');
const Branch = require('../models/Branch');
const BranchSaringInfo = require('../models/BranchSharingInfo');
const { getBranches } = require('../routes/controllers/branch.controller');
const { find } = require('../models/User');

class BranchService {
  constructor(userMongooseId, mode) {
    this.user = userMongooseId;
    this.mode = mode;
  }

  async getBranches() {
    try {
      //regular

    } catch (err) {

    }

  }

}