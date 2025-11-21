/**
 * Wallet Routes
 */

const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');

// Create payment session (API endpoint for Payment Service)
router.post('/pay', walletController.createPaymentSession);

// Show payment page (for users)
router.get('/pay/:transaction_id', walletController.showPaymentPage);

// Process payment submission
router.post('/pay/:transaction_id', walletController.processPaymentSubmission);

// Topup wallet
router.post('/topup', walletController.topupWallet);

module.exports = router;
