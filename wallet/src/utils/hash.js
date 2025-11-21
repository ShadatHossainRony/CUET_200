/**
 * Hash Utility
 * Bcrypt-based hashing for PINs
 */

const bcrypt = require('bcrypt');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

/**
 * Hash a PIN
 * @param {string} pin - Plain text PIN
 * @returns {Promise<string>} Hashed PIN
 */
async function hashPin(pin) {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

/**
 * Compare PIN with hash
 * @param {string} pin - Plain text PIN
 * @param {string} hash - Hashed PIN
 * @returns {Promise<boolean>} True if match
 */
async function comparePin(pin, hash) {
  return bcrypt.compare(pin, hash);
}

module.exports = {
  hashPin,
  comparePin,
};
