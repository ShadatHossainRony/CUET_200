/**
 * Auth Controller
 * Handles user authentication
 */

const User = require('../models/user.model');
const Session = require('../models/session.model');
const { comparePin } = require('../utils/hash');
const { generateSessionToken } = require('../utils/idGen');
const logger = require('../utils/logger');

/**
 * Login user
 */
async function login(req, res) {
  try {
    const { phone, pin } = req.body;

    // Validate input
    if (!phone || !pin) {
      return res.status(400).json({
        error: 'Phone and PIN are required',
      });
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid phone or PIN',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account is inactive',
      });
    }

    // Verify PIN
    const isValid = await comparePin(pin, user.pinHash);
    if (!isValid) {
      logger.warn(`Failed login attempt for phone: ${phone}`);
      return res.status(401).json({
        error: 'Invalid phone or PIN',
      });
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    const session = new Session({
      userId: user._id,
      token: sessionToken,
      expiresAt,
    });

    await session.save();

    logger.info(`User logged in: ${phone}`);

    res.json({
      sessionToken,
      userId: user._id.toString(),
      expiresAt,
    });

  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({
      error: 'Login failed',
      message: error.message,
    });
  }
}

/**
 * Logout user
 */
async function logout(req, res) {
  try {
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({
        error: 'Session token is required',
      });
    }

    await Session.deleteOne({ token: sessionToken });

    logger.info(`User logged out`);

    res.json({
      message: 'Logged out successfully',
    });

  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({
      error: 'Logout failed',
      message: error.message,
    });
  }
}

/**
 * Validate session middleware
 */
async function validateSession(req, res, next) {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken) {
      return res.status(401).json({
        error: 'No session token provided',
      });
    }

    const session = await Session.findOne({ token: sessionToken });

    if (!session || !session.isValid()) {
      return res.status(401).json({
        error: 'Invalid or expired session',
      });
    }

    // Attach user to request
    req.userId = session.userId;
    req.session = session;

    next();

  } catch (error) {
    logger.error(`Session validation error: ${error.message}`);
    res.status(500).json({
      error: 'Session validation failed',
    });
  }
}

module.exports = {
  login,
  logout,
  validateSession,
};
