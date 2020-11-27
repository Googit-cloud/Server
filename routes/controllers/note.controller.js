const NoteService = require('../../services/note.service');
const BranchService = require('../../services/branch.service');
const { responseResults } = require('../../constants');

const noteService = new NoteService();
const branchService = new BranchService();

exports.createNote = async (req, res, next) => {
  const blocks = req.body;
  const { user_id, branch_id } = req.params;

  try {
    const newNote
      = await noteService.createNote(
        user_id,
        branch_id,
        blocks
      );

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

    const updatedBranch = await branchService
      .getBranchByMongooseIdAndUpdate(branch._id, branch);

    res.status(201).json({
      result: responseResults.OK,
      newNote,
      updatedBranch
    });
  } catch (err) {
    next(err);
  }
};

exports.getNote = async (req, res, next) => {
  const { note_id } = req.params;

  try {
    const note
      = await noteService.getNoteByMongooseId(note_id);

    if (!note) {
      res.status(400).json({
        result: responseResults.FAILURE,
        message: '쪽지가 없습니다',
      });
    }

    res.status(200).json({
      result: responseResults.OK,
      note,
    });
  } catch (err) {
    next(err);
  }
};
