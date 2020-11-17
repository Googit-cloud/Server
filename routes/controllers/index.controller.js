const UserService = require('../../services/user.service');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res, next) => {
  const { uid, email, displayName, photoURL } = req.body;

  try {
    await new UserService()
      .createUser(uid, email, displayName, photoURL);

    res.status(201).json({ result: 'ok' });
  } catch (err) {
    if (err.message.includes('duplicate key error')) {
      res.status(303).json({
        result: 'failure',
        message: '이미 가입했어요',
      });

      return;
    }

    next(err);
  }
};

exports.loginUser = async (req, res, next) => {
  const { email } = req.body;
  let user;

  try {
    user = await new UserService().getUserByEmail(email);
  } catch (err) {

    next(err);
  }

  if (!user) {
    res.status(404).json({
      result: 'failure',
      message: '가입하지 않은 사용자예요',
    });
  }

  const token = jwt.sign(
    JSON.stringify(user),
    process.env.JWT_SECRET_KEY
  );

  res.status(200).json({
    result: 'ok',
    user,
    token,
  });
};
