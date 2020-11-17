const Branch = require('../../models/Branch');

exports.createBranch = async (req, res, next) => {
  try {
    const newBranch = await Branch.create({
      created_by: req.params.user_id,
      notes: [],
      shared_users_info: [],
    });

    console.log(newBranch);

    res.status(201).json({
      result: 'ok',
      newBranchId: newBranch._id
    });
  } catch (err) {
    next(err);
  }
};
