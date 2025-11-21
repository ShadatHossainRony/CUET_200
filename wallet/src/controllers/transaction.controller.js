/**
 * Transaction Controller
 * Handles transaction queries and history
 */

const Transaction = require('../models/transaction.model');
const PaySession = require('../models/paySession.model');
const logger = require('../utils/logger');

/**
 * Get transaction by transaction_id
 * GET /transactions/:transaction_id
 */
async function getTransaction(req, res) {
  try {
    const { transaction_id } = req.params;

    // Find transaction
    const transaction = await Transaction.findOne({ transaction_id })
      .populate('userId', 'phone name');

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
      });
    }

    // Also get pay session if exists
    const paySession = await PaySession.findOne({ transaction_id });

    res.json({
      transaction: {
        transaction_id: transaction.transaction_id,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        previousBalance: transaction.previousBalance,
        newBalance: transaction.newBalance,
        completedAt: transaction.completedAt,
        createdAt: transaction.createdAt,
        user: transaction.userId ? {
          phone: transaction.userId.phone,
        } : null,
      },
      paySession: paySession ? {
        status: paySession.status,
        callback_url: paySession.callback_url,
        callbackSuccess: paySession.callbackSuccess,
        callbackAttempts: paySession.callbackAttempts,
        wallet_tx_ref: paySession.wallet_tx_ref,
        expiresAt: paySession.expiresAt,
        failureReason: paySession.failureReason,
      } : null,
    });

  } catch (error) {
    logger.error(`Get transaction error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to fetch transaction',
      message: error.message,
    });
  }
}

/**
 * Get user's transaction history
 * GET /users/:userId/transactions
 */
async function getUserTransactions(req, res) {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { userId };
    if (type) query.type = type;
    if (status) query.status = status;

    // Get transactions
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Transaction.countDocuments(query);

    res.json({
      transactions: transactions.map(tx => ({
        transaction_id: tx.transaction_id,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        previousBalance: tx.previousBalance,
        newBalance: tx.newBalance,
        completedAt: tx.completedAt,
        createdAt: tx.createdAt,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });

  } catch (error) {
    logger.error(`Get user transactions error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to fetch transactions',
      message: error.message,
    });
  }
}

/**
 * Get transaction statistics for a user
 * GET /users/:userId/transactions/stats
 */
async function getUserTransactionStats(req, res) {
  try {
    const { userId } = req.params;
    const mongoose = require('mongoose');

    const stats = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    // Format stats
    const formatted = {
      PAYMENT: { count: 0, totalAmount: 0 },
      TOPUP: { count: 0, totalAmount: 0 },
    };

    stats.forEach(stat => {
      formatted[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount,
      };
    });

    // Get success rate
    const totalPayments = await Transaction.countDocuments({
      userId,
      type: 'PAYMENT',
    });

    const successPayments = await Transaction.countDocuments({
      userId,
      type: 'PAYMENT',
      status: 'SUCCESS',
    });

    const successRate = totalPayments > 0
      ? ((successPayments / totalPayments) * 100).toFixed(2)
      : 0;

    res.json({
      stats: formatted,
      successRate: parseFloat(successRate),
      totalTransactions: formatted.PAYMENT.count + formatted.TOPUP.count,
    });

  } catch (error) {
    logger.error(`Get transaction stats error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to fetch transaction stats',
      message: error.message,
    });
  }
}

module.exports = {
  getTransaction,
  getUserTransactions,
  getUserTransactionStats,
};
