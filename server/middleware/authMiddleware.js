// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Get the token from the request header
  const token = req.header('x-auth-token');

  // 2. Check if there's no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. If there is a token, verify it
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add the user's ID from the token payload to the request object
    req.user = decoded.user;

    // Pass the request on to the next function (the actual route)
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};