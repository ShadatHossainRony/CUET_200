/**
 * Callback Service
 * Handles payment success callbacks to Payment Service with retry logic
 */

const axios = require('axios');
const crypto = require('crypto');
const PaySession = require('../models/paySession.model');
const logger = require('../utils/logger');

const MAX_RETRIES = parseInt(process.env.CALLBACK_RETRY_ATTEMPTS) || 3;
const RETRY_DELAY = parseInt(process.env.CALLBACK_RETRY_DELAY_MS) || 1000;

/**
 * Send callback to Payment Service
 * @param {Object} paySession - Pay session document
 * @param {Object} paymentData - Payment data to send
 * @param {string} type - 'success' or 'failure'
 * @returns {Promise<boolean>} True if callback succeeded
 */
async function sendCallback(paySession, paymentData, type = 'success') {
  // Check if callback already succeeded (idempotency)
  if (paySession.callbackSuccess) {
    logger.info(`Callback already succeeded for transaction: ${paySession.transaction_id}`);
    return true;
  }

  // Determine callback URL based on type
  let callback_url;
  if (type === 'failure' && paySession.meta?.callback_fail_url) {
    callback_url = paySession.meta.callback_fail_url;
  } else {
    callback_url = paySession.callback_url;
  }

  const payload = {
    transactionId: paymentData.transaction_id, // Changed to match payment service expectation
    amount: paymentData.amount,
    userPhone: paymentData.user_phone,
    userId: paymentData.user_id,
    status: type === 'success' ? 'SUCCESS' : 'FAILED',
    walletTxRef: paymentData.wallet_tx_ref || null,
    failureReason: paymentData.failure_reason || null,
    timestamp: new Date().toISOString(),
  };

  logger.info(`Sending ${type} callback to: ${callback_url}`, payload);

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.patch(callback_url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Wallet-Signature': generateSignature(payload),
        },
        timeout: 10000, // 10 second timeout
      });

      if (response.status >= 200 && response.status < 300) {
        // Success!
        paySession.callbackSuccess = true;
        paySession.callbackAttempts = attempt;
        paySession.callbackLastAttempt = new Date();
        await paySession.save();

        logger.info(`Callback succeeded for transaction: ${paySession.transaction_id} on attempt ${attempt}`);
        return true;
      }

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      logger.warn(`Callback failed with status ${response.status} on attempt ${attempt}/${MAX_RETRIES}`);

    } catch (error) {
      lastError = error;
      logger.warn(`Callback attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);

      // Update attempts
      paySession.callbackAttempts = attempt;
      paySession.callbackLastAttempt = new Date();
      await paySession.save();

      // If not last attempt, wait before retry with exponential backoff
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
        logger.info(`Retrying callback in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  // All attempts failed
  logger.error(`All callback attempts failed for transaction: ${paySession.transaction_id}. Last error: ${lastError?.message}`);
  return false;
}

/**
 * Generate callback signature for verification
 * @param {Object} payload - Callback payload
 * @returns {string} Signature
 */
function generateSignature(payload) {
  const secret = process.env.WEBHOOK_SECRET || process.env.SESSION_SECRET || 'default-secret-change-in-production';
  const data = JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Sleep for given milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send failure callback to Payment Service
 * @param {Object} paySession - Pay session document
 * @param {string} failureReason - Reason for failure
 * @returns {Promise<boolean>} True if callback succeeded
 */
async function sendFailureCallback(paySession, failureReason) {
  const paymentData = {
    transaction_id: paySession.transaction_id,
    amount: paySession.amount,
    user_phone: paySession.userPhone || null,
    user_id: paySession.userId || null,
    wallet_tx_ref: null,
    failure_reason: failureReason,
  };

  return sendCallback(paySession, paymentData, 'failure');
}

/**
 * Retry failed callbacks (can be run periodically)
 * @returns {Promise<number>} Number of successful retries
 */
async function retryFailedCallbacks() {
  const failedSessions = await PaySession.find({
    status: 'SUCCESS',
    callbackSuccess: false,
    callbackAttempts: { $lt: MAX_RETRIES },
  }).limit(10);

  let successCount = 0;

  for (const session of failedSessions) {
    const paymentData = {
      transaction_id: session.transaction_id,
      amount: session.amount,
      user_phone: session.userPhone,
      user_id: session.userId,
      wallet_tx_ref: session.wallet_tx_ref,
    };

    const success = await sendCallback(session, paymentData, 'success');
    if (success) successCount++;
  }

  if (successCount > 0) {
    logger.info(`Retried ${failedSessions.length} failed callbacks, ${successCount} succeeded`);
  }

  return successCount;
}

module.exports = {
  sendCallback,
  sendFailureCallback,
  retryFailedCallbacks,
  generateSignature,
};
