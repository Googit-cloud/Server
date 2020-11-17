const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId, // virtual?
    ref: 'User',
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  },
  title: {
    type: String,
    // required: true,
  },
  content: {
    type: String,
  },
  // changes: [], // markup 저장,, 비교할땐 태그 빼고 비교...
  previous_version: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'Note',
  },
  next_version: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'Note',
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
});

const Note = mongoose.model('Note', NoteSchema);

module.exports = Note;
