const User = require('../../models/User');
const Branch = require('../../models/Branch');

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
<<<<<<< HEAD
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

=======
>>>>>>> feat: create branch and note on client post
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