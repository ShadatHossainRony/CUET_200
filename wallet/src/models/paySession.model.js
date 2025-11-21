/**
 * PaySession Model
 * Represents payment sessions created by Payment Service
 */

const mongoose = require('mongoose');

const paySessionSchema = new mongoose.Schema({
  transaction_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'],
    default: 'PENDING',
    index: true,
  },
  callback_url: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  userPhone: {
    type: String,
    default: null,
  },
  wallet_tx_ref: {
    type: String,
    default: null,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  failureReason: {
    type: String,
    default: null,
  },
  callbackAttempts: {
    type: Number,
    default: 0,
  },
  callbackSuccess: {
    type: Boolean,
    default: false,
  },
  callbackLastAttempt: {
    type: Date,
    default: null,
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes
paySessionSchema.index({ transaction_id: 1 });
paySessionSchema.index({ status: 1 });
paySessionSchema.index({ expiresAt: 1 });
paySessionSchema.index({ createdAt: -1 });

// Instance method to check if session is expired
paySessionSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Instance method to check if payment can be processed
paySessionSchema.methods.canProcess = function() {
  if (this.isExpired()) {
    return { valid: false, reason: 'Transaction has expired' };
  }
  if (this.status !== 'PENDING') {
    return { valid: false, reason: `Transaction already ${this.status.toLowerCase()}` };
  }
  return { valid: true };
};

// Static method to expire old pending transactions
paySessionSchema.statics.expireOldTransactions = async function() {
  const now = new Date();
  const result = await this.updateMany(
    { status: 'PENDING', expiresAt: { $lt: now } },
    { $set: { status: 'EXPIRED' } }
  );
  return result.modifiedCount;
};

const PaySession = mongoose.model('PaySession', paySessionSchema);

module.exports = PaySession;
