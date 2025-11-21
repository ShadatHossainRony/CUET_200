/**
 * User Transaction Routes
 */

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

// Get user's transaction history
router.get('/:userId/transactions', transactionController.getUserTransactions);

// Get user's transaction statistics
router.get('/:userId/transactions/stats', transactionController.getUserTransactionStats);

module.exports = router;
