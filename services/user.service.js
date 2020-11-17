const User = require('../models/User');

class UserService {
  async createUser(
    uid,
    email,
    displayName,
    photoURL,
  ) {
    try {
      await User.create({
        uid,
        email,
        username: displayName,
        profile_img_url: photoURL,
      });
    } catch (err) {
      throw err;
    }
  }

  async getUserByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (err) {
      throw err;
    }
  }

  async getUserByMongooseId(id) {
    try {
      return await User.findById(id);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = UserService;
