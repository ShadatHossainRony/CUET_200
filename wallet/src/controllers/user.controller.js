/**
 * User Controller
 * Handles user creation and management
 */

const User = require('../models/user.model');
const { hashPin } = require('../utils/hash');
const logger = require('../utils/logger');

/**
 * Create a new user
 */
async function createUser(req, res) {
  try {
    const { phone, pin, initialBalance = 0 } = req.body;

    // Validate input
    if (!phone || !pin) {
      return res.status(400).json({
        error: 'Phone and PIN are required',
      });
    }

    // Validate phone format
    if (!/^01[0-9]{9}$/.test(phone)) {
      return res.status(400).json({
        error: 'Invalid phone number format. Must be 11 digits starting with 01',
      });
    }

    // Validate PIN (4-6 digits)
    if (!/^[0-9]{4,6}$/.test(pin)) {
      return res.status(400).json({
        error: 'PIN must be 4-6 digits',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({
        error: 'User with this phone number already exists',
      });
    }

    // Hash PIN
    const pinHash = await hashPin(pin);

    // Create user
    const user = new User({
      phone,
      pinHash,
      balance: Math.max(0, initialBalance),
    });

    await user.save();

    logger.info(`User created: ${phone}, Balance: ${user.balance}`);

    res.status(201).json({
      userId: user._id,
      phone: user.phone,
      balance: user.balance,
    });

  } catch (error) {
    logger.error(`Create user error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to create user',
      message: error.message,
    });
  }
}

/**
 * Get user by phone
 */
async function getUserByPhone(req, res) {
  try {
    const { phone } = req.params;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json(user.toSafeObject());

  } catch (error) {
    logger.error(`Get user error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to get user',
      message: error.message,
    });
  }
}

/**
 * Get user by ID
 */
async function getUserById(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json(user.toSafeObject());

  } catch (error) {
    logger.error(`Get user error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to get user',
      message: error.message,
    });
  }
}

module.exports = {
  createUser,
  getUserByPhone,
  getUserById,
};
