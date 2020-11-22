const NoteService = require('../../services/note.service');
const BranchService = require('../../services/branch.service');

exports.createNote = async (req, res, next) => {
  console.log('createNote')
  const blocks = req.body;
  const { user_id, branch_id } = req.params;
  const branchService = new BranchService();
  const noteService = new NoteService();

  try {
    const newNote
      = await noteService.createNote(
        user_id,
        branch_id,
        blocks
      );
    // console.log(newNote);
    const newNoteId = newNote._id;
    const branch
      = await branchService.getBranchByMongooseId(branch_id);

    if (branch.latest_note) {
      const previousLatestNoteId = branch.latest_note;

      branch.notes_history.push(previousLatestNoteId);

      const previousLatestNote
        = await noteService.getNoteByMongooseId(previousLatestNoteId);

      previousLatestNote.next_version = newNoteId;

      await noteService.getNoteByMongooseIdAndUpdate(
        previousLatestNoteId,
        previousLatestNote,
      );

      newNote.previous_version = previousLatestNoteId;

      await noteService.getNoteByMongooseIdAndUpdate(
        newNoteId,
        newNote
      );
    }

    branch.latest_note = newNoteId;

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

exports.getNote = async (res, req, next) => {

};
