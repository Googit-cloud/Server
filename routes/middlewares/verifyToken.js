const UserService = require('../../services/user.service');
const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    );

    const user
      = await new UserService()
        .getUserByMongooseId(decoded._id);

    if (!user) {
      res.status(404).json({
        result: 'failure',
        message: '이용자를 찾지 못했어요',
      });
    }

    res.locals.decodedUserId = user._id;

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = verifyToken;
