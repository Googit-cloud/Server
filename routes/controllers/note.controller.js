const mongoose = require('mongoose');
const NoteService = require('../../services/note.service');
const BranchService = require('../../services/branch.service');

exports.createNote = async (req, res, next) => {
  const { title, content, branch } = req.body;

  try {
    const newNote
      = await new NoteService().createNote(
        req.params.user_id,
        mongoose.Types.ObjectId(branch._id),
        title,
        content
      );

    branch.notes.push(newNote._id);

    await new BranchService().getBranchByMongooseIdAndUpdate(branch._id, branch);

    res.status(201).json({
      result: 'ok',
      newNote
    });
  } catch (err) {
    next(err);
  }
};
