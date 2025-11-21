/**
 * Wallet Controller
 * Handles wallet operations: payment initiation, payment completion, topup
 */

const User = require('../models/user.model');
const PaySession = require('../models/paySession.model');
const { comparePin } = require('../utils/hash');
const { generateTransactionId } = require('../utils/idGen');
const { processPayment, markPaymentFailed, processTopup } = require('../services/paymentProcessing.service');
const { sendCallback } = require('../services/callback.service');
const logger = require('../utils/logger');

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL;
const TRANSACTION_EXPIRY_HOURS = parseInt(process.env.TRANSACTION_EXPIRY_HOURS) || 1;

/**
 * Create payment session (called by Payment Service)
 * POST /wallet/pay
 */
async function createPaymentSession(req, res) {
  try {
    const { amount, metadata = {} } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0',
      });
    }

    // Generate transaction ID
    const transaction_id = generateTransactionId();

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TRANSACTION_EXPIRY_HOURS);

    // Create callback URL
    const callback_url = `${PAYMENT_SERVICE_URL}/payment/success/${transaction_id}`;

    // Create pay session
    const paySession = new PaySession({
      transaction_id,
      amount,
      status: 'PENDING',
      callback_url,
      expiresAt,
      meta: metadata,
    });

    await paySession.save();

    // Generate pay URL
    const pay_url = `${req.protocol}://${req.get('host')}/wallet/pay/${transaction_id}`;

    logger.info(`Payment session created: ${transaction_id}, Amount: ${amount}`);

    res.status(201).json({
      transaction_id,
      pay_url,
      expires_at: expiresAt,
    });

  } catch (error) {
    logger.error(`Create payment session error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to create payment session',
      message: error.message,
    });
  }
}

/**
 * Show payment page
 * GET /wallet/pay/:transaction_id
 */
async function showPaymentPage(req, res) {
  try {
    const { transaction_id } = req.params;

    const paySession = await PaySession.findOne({ transaction_id });

    if (!paySession) {
      return res.status(404).render('error', {
        title: 'Payment Not Found',
        message: 'Payment session not found',
        error: 'Invalid transaction ID',
      });
    }

    // Check if expired
    if (paySession.isExpired()) {
      if (paySession.status === 'PENDING') {
        paySession.status = 'EXPIRED';
        await paySession.save();
      }

      return res.render('error', {
        title: 'Payment Expired',
        message: 'This payment link has expired',
        error: `Transaction expired at ${paySession.expiresAt.toLocaleString()}`,
      });
    }

    // Check status
    if (paySession.status === 'SUCCESS') {
      return res.render('success', {
        title: 'Payment Already Completed',
        message: 'This payment has already been processed',
        transaction_id,
        amount: paySession.amount,
      });
    }

    if (paySession.status === 'FAILED') {
      return res.render('failed', {
        title: 'Payment Failed',
        message: 'This payment has failed',
        reason: paySession.failureReason || 'Unknown error',
        transaction_id,
      });
    }

    // Render payment form
    res.render('pay', {
      title: 'Complete Payment',
      transaction_id,
      amount: paySession.amount,
      expires_at: paySession.expiresAt.toLocaleString(),
    });

  } catch (error) {
    logger.error(`Show payment page error: ${error.message}`);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred',
      error: error.message,
    });
  }
}

/**
 * Process payment submission
 * POST /wallet/pay/:transaction_id
 */
async function processPaymentSubmission(req, res) {
  try {
    const { transaction_id } = req.params;
    const { phone, pin } = req.body;

    // Validate input
    if (!phone || !pin) {
      return res.status(400).render('failed', {
        title: 'Payment Failed',
        message: 'Phone and PIN are required',
        reason: 'Missing credentials',
        transaction_id,
      });
    }

    // Find pay session
    const paySession = await PaySession.findOne({ transaction_id });

    if (!paySession) {
      return res.status(404).render('error', {
        title: 'Payment Not Found',
        message: 'Payment session not found',
        error: 'Invalid transaction ID',
      });
    }

    // Check if can be processed
    const canProcess = paySession.canProcess();
    if (!canProcess.valid) {
      if (paySession.status === 'SUCCESS') {
        // Already paid - show success (idempotency)
        return res.render('success', {
          title: 'Payment Already Completed',
          message: 'This payment has already been processed',
          transaction_id,
          amount: paySession.amount,
          wallet_tx_ref: paySession.wallet_tx_ref,
        });
      }

      return res.render('failed', {
        title: 'Payment Failed',
        message: canProcess.reason,
        reason: canProcess.reason,
        transaction_id,
      });
    }

    // Find and authenticate user
    const user = await User.findOne({ phone });

    if (!user) {
      await markPaymentFailed(paySession, 'USER_NOT_FOUND');
      return res.render('failed', {
        title: 'Payment Failed',
        message: 'Invalid phone number or PIN',
        reason: 'Authentication failed',
        transaction_id,
      });
    }

    if (!user.isActive) {
      await markPaymentFailed(paySession, 'ACCOUNT_INACTIVE');
      return res.render('failed', {
        title: 'Payment Failed',
        message: 'Account is inactive',
        reason: 'Account inactive',
        transaction_id,
      });
    }

    // Verify PIN
    const isValidPin = await comparePin(pin, user.pinHash);

    if (!isValidPin) {
      logger.warn(`Failed payment attempt: Invalid PIN for ${phone}, Transaction: ${transaction_id}`);
      await markPaymentFailed(paySession, 'INVALID_PIN');
      return res.render('failed', {
        title: 'Payment Failed',
        message: 'Invalid phone number or PIN',
        reason: 'Authentication failed',
        transaction_id,
      });
    }

    // Process payment atomically
    const result = await processPayment(paySession, user);

    if (!result.success) {
      await markPaymentFailed(paySession, result.reason);
      return res.render('failed', {
        title: 'Payment Failed',
        message: result.message,
        reason: result.reason,
        transaction_id,
        balance: user.balance,
        amount: paySession.amount,
      });
    }

    // Payment successful - send callback (don't wait for it)
    if (!result.alreadyProcessed) {
      // Send callback asynchronously
      sendCallback(paySession, result.data).catch(error => {
        logger.error(`Callback failed for ${transaction_id}: ${error.message}`);
      });
    }

    // Show success page
    res.render('success', {
      title: 'Payment Successful',
      message: 'Your payment has been processed successfully',
      transaction_id,
      amount: paySession.amount,
      wallet_tx_ref: result.data.wallet_tx_ref,
      new_balance: result.data.new_balance,
    });

  } catch (error) {
    logger.error(`Process payment error: ${error.message}`);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while processing your payment',
      error: error.message,
    });
  }
}

/**
 * Topup wallet
 * POST /wallet/topup
 */
async function topupWallet(req, res) {
  try {
    const { phone, amount } = req.body;

    // Validate input
    if (!phone || !amount) {
      return res.status(400).json({
        error: 'Phone and amount are required',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0',
      });
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Process topup
    const result = await processTopup(phone, amount);

    res.json({
      balance: result.balance,
      transactionId: result.transactionId,
      amount: result.amount,
    });

  } catch (error) {
    logger.error(`Topup error: ${error.message}`);
    res.status(500).json({
      error: 'Topup failed',
      message: error.message,
    });
  }
}

module.exports = {
  createPaymentSession,
  showPaymentPage,
  processPaymentSubmission,
  topupWallet,
};
