const Note = require('../models/Note');

class NoteService {
  async createNote(user_id, branch_id, title, content) {
    try {
      return await Note.create({
        created_by: user_id,
        parent: branch_id,
        title,
        content,
      });
    } catch (err) {
      throw err;
    }
  }
}

module.exports = NoteService;
