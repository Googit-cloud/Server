const jwt = require('jsonwebtoken');

exports.verifyUser = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    );

    const user = await User.findById(decoded._id);

    if (!user) {
      res.status(404).json({
        result: 'failure',
        message: 'bad request',
      });
    }

    next();
  } catch (err) {
    res.status(400).json({
      result: 'failure',
      message: 'bad request'
    });
  }
};
