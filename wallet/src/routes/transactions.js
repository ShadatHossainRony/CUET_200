/**
 * Transaction Routes
 */

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

// Get transaction by ID
router.get('/:transaction_id', transactionController.getTransaction);

module.exports = router;
