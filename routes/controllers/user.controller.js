const UserService = require('../../services/user.service');
const jwt = require('jsonwebtoken');

exports.getCurrentUser = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    );

    const user
      = await new UserService()
        .getUserByMongooseId(decoded._id);

    res.status(200).json({
      result: 'ok',
      user,
    });
  } catch (err) {
    res.status(400).json({
      result: 'failure',
      message: 'bad request'
    });
  }
};
