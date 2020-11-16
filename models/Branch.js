const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  notes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  }],
  shared_users_info: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BranchSharingInfo',
  }]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
});

const Branch = mongoose.model('Branch', BranchSchema);

module.exports = Branch;
