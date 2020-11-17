const User = require('../../models/User');
const Branch = require('../../models/Branch');
const BranchSharingInfo = require('../../models/BranchSharingInfo');

exports.createBranch = async (req, res, next) => {
  try {
    const newBranch = await Branch.create({
      created_by: req.params.user_id,
      notes: [],
      shared_users_info: [],
    });

    res.status(201).json({
      result: 'ok',
      newBranch
    });
  } catch (err) {
    next(err);
  }
};

exports.unShiftNoteToBranch = async (req, res, next) => {
  const branch = req.body;
  const { branch_id, note_id } = req.params;

  branch.notes.unshift(note_id);

  try {
    await Branch.findByIdAndUpdate(
      branch_id,
      branch,
      { new: true },
    );

    res.status(200).json({
      result: 'ok'
    });
  } catch (err) {
    next(err);
  }
};

exports.getBranches = async (req, res, next) => {
  try {
    console.log('all')
    const userId = req.params.user_id;
    const users = await User.findById(userId);

    // get shared branches info through branchSharingInfo
    const branchSharingInfoIds = users.shared_branches_info;
    const sharedBranchesIds = await Promise.all(
      branchSharingInfoIds.map(async (sharingInfo) => {
        const branchesSharingInfo = await BranchSharingInfo.findById(sharingInfo);
        return branchesSharingInfo.branch_id;
      })
    );

    const sharedBranches = await Promise.all(
      sharedBranchesIds.map(async (branchId) => {
        const sharedBranch = await Branch.findById(branchId);
        return sharedBranch;
      })
    );

    // get branches by my_branches
    const myBranchesIds = users.my_branches;
    const myBranches = await Promise.all(
      myBranchesIds.map(async (branchId) => {
        const myBranch = await Branch.findById(branchId)
        return myBranch;
      })
    );

    const accessibleBranchList = [...sharedBranches, ...myBranches]
    // console.log(userId, 'the userId of the current user in regular')
    // console.log(sharedBranches, 'shared branch list from the current user in regular')
    // console.log(myBranches, 'the list of the branches created by the current user in regular');

    res.status(200).json({
      result: 'ok',
      data: accessibleBranchList
    });
  } catch (err) {
    next(err);
  }
};

exports.getPrivateBranches = async (req, res, next) => {
  try {
    console.log('private')
    console.log(req.params, req.originalUrl, 'private');

    const userId = req.params.user_id;
    const users = await User.findById(userId);

    const myBranchesIds = users.my_branches;
    const myBranches = await Promise.all(
      myBranchesIds.map(async (branchId) => {
        const myBranch = await Branch.findById(branchId)
        return myBranch;
      })
    );

    res.json({
      result: 'ok',
      data: myBranches
    });
  } catch (err) {
    next(err);
  }
};
