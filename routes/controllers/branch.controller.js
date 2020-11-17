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
    });
  } catch (err) {
    next(err);
  }
};
