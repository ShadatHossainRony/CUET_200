/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Create user
router.post('/', userController.createUser);

// Get user by phone
router.get('/phone/:phone', userController.getUserByPhone);

// Get user by ID
router.get('/:userId', userController.getUserById);

module.exports = router;
