// server/routes/user.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // <-- Import our security guard
const User = require('../models/User');

// @route   GET api/user/me
// @desc    Get current logged-in user's data
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  // If the request gets this far, it means the middleware has approved the token.
  try {
    // We can get the user ID from the request object (added by the middleware)
    const user = await User.findById(req.user.id).select('-password'); // .select('-password') removes the password hash from the response
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;