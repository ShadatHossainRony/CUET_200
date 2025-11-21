/**
 * Payment Processing Service
 * Handles atomic balance deduction and transaction creation
 */

const mongoose = require('mongoose');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const PaySession = require('../models/paySession.model');
const { generateWalletTxRef } = require('../utils/idGen');
const logger = require('../utils/logger');

/**
 * Process payment (no transactions - simple for standalone MongoDB)
 * @param {Object} paySession - Pay session document
 * @param {Object} user - User document
 * @returns {Promise<Object>} Result with success status and data
 */
async function processPayment(paySession, user) {
  try {
    // Check if already processed (idempotency)
    if (paySession.status === 'SUCCESS') {
      return {
        success: true,
        alreadyProcessed: true,
        message: 'Payment already processed',
        data: {
          transaction_id: paySession.transaction_id,
          wallet_tx_ref: paySession.wallet_tx_ref,
          new_balance: user.balance,
        },
      };
    }

    // Check balance
    if (!user.hasSufficientBalance(paySession.amount)) {
      return {
        success: false,
        reason: 'INSUFFICIENT_BALANCE',
        message: `Insufficient balance. Required: ${paySession.amount}, Available: ${user.balance}`,
      };
    }

    // Store previous balance
    const previousBalance = user.balance;

    // Deduct balance atomically using findOneAndUpdate
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        balance: { $gte: paySession.amount },
        isActive: true,
      },
      {
        $inc: { balance: -paySession.amount },
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return {
        success: false,
        reason: 'DEDUCTION_FAILED',
        message: 'Failed to deduct balance. User may have insufficient funds or account is inactive.',
      };
    }

    // Generate wallet transaction reference
    const walletTxRef = generateWalletTxRef();

    // Create transaction record
    const transaction = new Transaction({
      transaction_id: walletTxRef,
      type: 'PAYMENT',
      amount: paySession.amount,
      status: 'SUCCESS',
      userId: user._id,
      previousBalance,
      newBalance: updatedUser.balance,
      completedAt: new Date(),
      meta: {
        paySessionId: paySession.transaction_id,
        phone: user.phone,
      },
    });

    await transaction.save();

    // Update pay session
    paySession.status = 'SUCCESS';
    paySession.userId = user._id;
    paySession.userPhone = user.phone;
    paySession.wallet_tx_ref = walletTxRef;
    paySession.completedAt = new Date();
    await paySession.save();

    logger.info(`Payment processed successfully: ${paySession.transaction_id}, User: ${user.phone}, Amount: ${paySession.amount}`);

    return {
      success: true,
      message: 'Payment processed successfully',
      data: {
        transaction_id: paySession.transaction_id,
        wallet_tx_ref: walletTxRef,
        user_id: user._id,
        user_phone: user.phone,
        amount: paySession.amount,
        previous_balance: previousBalance,
        new_balance: updatedUser.balance,
      },
    };

  } catch (error) {
    logger.error(`Payment processing error: ${error.message}`);
    throw error;
  }
}

/**
 * Mark payment session as failed
 * @param {Object} paySession - Pay session document
 * @param {string} reason - Failure reason
 * @returns {Promise<void>}
 */
async function markPaymentFailed(paySession, reason) {
  paySession.status = 'FAILED';
  paySession.failureReason = reason;
  paySession.completedAt = new Date();
  await paySession.save();
  
  logger.info(`Payment marked as failed: ${paySession.transaction_id}, Reason: ${reason}`);
}

/**
 * Process topup (no transactions - simple for standalone MongoDB)
 * @param {string} phone - User phone number
 * @param {number} amount - Topup amount
 * @returns {Promise<Object>} Result with new balance and transaction ID
 */
async function processTopup(phone, amount) {
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      throw new Error('User not found');
    }

    const previousBalance = user.balance;
    
    // Increase balance atomically
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $inc: { balance: amount } },
      { new: true }
    );

    // Create transaction record
    const walletTxRef = generateWalletTxRef();
    const transaction = new Transaction({
      transaction_id: walletTxRef,
      type: 'TOPUP',
      amount,
      status: 'SUCCESS',
      userId: user._id,
      previousBalance,
      newBalance: updatedUser.balance,
      completedAt: new Date(),
      meta: { phone },
    });

    await transaction.save();

    logger.info(`Topup processed: User: ${phone}, Amount: ${amount}, New Balance: ${updatedUser.balance}`);

    return {
      balance: updatedUser.balance,
      transactionId: walletTxRef,
      amount,
    };

  } catch (error) {
    logger.error(`Topup processing error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  processPayment,
  markPaymentFailed,
  processTopup,
};
