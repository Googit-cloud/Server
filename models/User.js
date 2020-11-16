const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  profile_img_url: {
    type: String,
  },
  my_branches: [],
  shared_branches_info: [],
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
