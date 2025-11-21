/**
 * Auth Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Login
router.post('/login', authController.login);

// Logout
router.post('/logout', authController.logout);

// Validate session (for testing)
router.get('/validate', authController.validateSession, (req, res) => {
  res.json({
    valid: true,
    userId: req.userId,
    sessionId: req.session._id,
  });
});

module.exports = router;
