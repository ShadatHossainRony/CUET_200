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
 * Process payment atomically
 * @param {Object} paySession - Pay session document
 * @param {Object} user - User document
 * @returns {Promise<Object>} Result with success status and data
 */
async function processPayment(paySession, user) {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    // Check if already processed (idempotency)
    if (paySession.status === 'SUCCESS') {
      await session.abortTransaction();
      return {
        success: true,
        alreadyProcessed: true,
        message: 'Payment already processed',
        data: {
          transaction_id: paySession.transaction_id,
          wallet_tx_ref: paySession.wallet_tx_ref,
        },
      };
    }

    // Check balance
    if (!user.hasSufficientBalance(paySession.amount)) {
      await session.abortTransaction();
      return {
        success: false,
        reason: 'INSUFFICIENT_BALANCE',
        message: `Insufficient balance. Required: ${paySession.amount}, Available: ${user.balance}`,
      };
    }

    // Atomic balance deduction
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
        session,
      }
    );

    if (!updatedUser) {
      await session.abortTransaction();
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
      previousBalance: user.balance,
      newBalance: updatedUser.balance,
      completedAt: new Date(),
      meta: {
        paySessionId: paySession.transaction_id,
        phone: user.phone,
      },
    });

    await transaction.save({ session });

    // Update pay session
    paySession.status = 'SUCCESS';
    paySession.userId = user._id;
    paySession.userPhone = user.phone;
    paySession.wallet_tx_ref = walletTxRef;
    paySession.completedAt = new Date();
    await paySession.save({ session });

    // Commit transaction
    await session.commitTransaction();

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
        previous_balance: user.balance,
        new_balance: updatedUser.balance,
      },
    };

  } catch (error) {
    await session.abortTransaction();
    logger.error(`Payment processing error: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
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
 * Process topup
 * @param {string} phone - User phone number
 * @param {number} amount - Topup amount
 * @returns {Promise<Object>} Result with new balance and transaction ID
 */
async function processTopup(phone, amount) {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const user = await User.findOne({ phone }).session(session);
    if (!user) {
      await session.abortTransaction();
      throw new Error('User not found');
    }

    const previousBalance = user.balance;
    
    // Increase balance
    user.balance += amount;
    await user.save({ session });

    // Create transaction record
    const walletTxRef = generateWalletTxRef();
    const transaction = new Transaction({
      transaction_id: walletTxRef,
      type: 'TOPUP',
      amount,
      status: 'SUCCESS',
      userId: user._id,
      previousBalance,
      newBalance: user.balance,
      completedAt: new Date(),
      meta: { phone },
    });

    await transaction.save({ session });

    await session.commitTransaction();

    logger.info(`Topup processed: User: ${phone}, Amount: ${amount}, New Balance: ${user.balance}`);

    return {
      balance: user.balance,
      transactionId: walletTxRef,
      amount,
    };

  } catch (error) {
    await session.abortTransaction();
    logger.error(`Topup processing error: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = {
  processPayment,
  markPaymentFailed,
  processTopup,
};
