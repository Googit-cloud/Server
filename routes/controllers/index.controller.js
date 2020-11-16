const User = require('../../models/User');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res, next) => {
  const { uid, email, displayName, photoURL } = req.body;

  try {
    await User.create({
      uid,
      email,
      username: displayName,
      profile_img_url: photoURL,
    });

    res.status(201).json({ result: 'ok' });
  } catch (err) {
    console.log(err.message);

    if (err.message.includes('duplicate key error')) {
      res.status(303).json({
        result: 'failure',
        message: '이미 가입했어요',
      });

      return;
    }

    res.json({
      result: 'failure',
      message: '오류가 났어요'
    });
  }
};

exports.loginUser = async (req, res, next) => {
  const { email } = req.body;
  let user;

  try {
    user = await User.findOne({ email });
  } catch (err) {
    res.json({
      result: 'failure',
      message: '오류가 났어요',
    });
  }

  if (!user) {
    res.json({
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
