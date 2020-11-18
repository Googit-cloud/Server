const User = require('../../models/User');
const BranchService = require('../../services/branch.service');
const UserService = require('../../services/user.service');

exports.createBranch = async (req, res, next) => {
  const user = req.body;
  const { user_id } = req.params;

  try {
    const newBranch = await new BranchService().createBranch(user_id);

    user.my_branches.push(newBranch._id);

    const updatedUser
      = await new UserService()
        .getUserByMongooseIdAndUpdate(user_id, user);

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
    console.log(req.params, req.body, 'regular');
    const userId = req.params.user_id;
    const users = await User.findById(userId);
    console.log(users, ' users');
    const branchId = users.my_branches;
    const branches = branchId.map((id) => {

    });
    res.json('success');
  } catch (err) {
    next(err);
  }
};

exports.getPrivateBranches = async (req, res, next) => {
  try {
    console.log(req.params, req.originalUrl, 'private');
    res.json('success');
  } catch (err) {
    next(err);
  }
};
