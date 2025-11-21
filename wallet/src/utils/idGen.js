/**
 * ID Generation Utility
 * Generates unique IDs for transactions
 */

const shortid = require('shortid');
const crypto = require('crypto');

/**
 * Generate a unique transaction ID
 * @returns {string} Transaction ID with prefix
 */
function generateTransactionId() {
  return `tx_${shortid.generate()}`;
}

/**
 * Generate a unique wallet transaction reference
 * @returns {string} Wallet transaction reference
 */
function generateWalletTxRef() {
  return `wallet_tx_${shortid.generate()}`;
}

/**
 * Generate a session token
 * @returns {string} Random session token
 */
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a unique reference ID
 * @returns {string} Reference ID
 */
function generateRefId() {
  return `ref_${Date.now()}_${shortid.generate()}`;
}

module.exports = {
  generateTransactionId,
  generateWalletTxRef,
  generateSessionToken,
  generateRefId,
};
