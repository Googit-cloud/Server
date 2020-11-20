const NoteService = require('../../services/note.service');
const BranchService = require('../../services/branch.service');

exports.createNote = async (req, res, next) => {
  const { title, content } = req.body;
  const { user_id, branch_id } = req.params;
  const branchService = new BranchService();

  try {
    const newNote
      = await new NoteService().createNote(
        user_id,
        branch_id,
        title,
        content,
      );

    const branch
      = branchService.getBranchByMongooseId(branch_id);

    if (branch.latest_note) {
      branch.notes_history.push(branch.latest_note);
    }

    branch.latest_note = newNote._id;

    await branchService
      .getBranchByMongooseIdAndUpdate(branch_id, branch);

    res.status(201).json({
      result: 'ok',
      newNote,
    });
  } catch (err) {
    next(err);
  }
};
