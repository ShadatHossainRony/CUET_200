const axios = require('axios');
const Transaction = require('../models/Transaction');
const { queueNotification } = require('../config/queue');

const WALLET_SERVICE_URL =
    process.env.WALLET_SERVICE_URL || 'http://localhost:9001';

/**
 * Process Payment Request
 * Enqueues payment for async processing via BullMQ
 */
async function processPaymentRequest(req, res) {
    try {
        const { campaignId, amount } = req.body || {};

        // Validation
        if (!campaignId || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: campaignId, amount are required',
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Amount must be greater than 0',
            });
        }

        const walletRes = await axios.post(`${WALLET_SERVICE_URL}/wallet/pay`, {
            amount,
            metadata: {
                campaignId,
            },
        });

        const metadata = {
            campaignId,
        };
        if (req.user?.id) {
            metadata.userId = req.user.id;
        }

        // Create transaction record with pending status
        const transaction = new Transaction({
            transactionId: walletRes.data.transaction_id,
            campaignId,
            amount,
            status: 'pending',
            metadata: metadata,
        });

        await transaction.save();

        const redirectUrl = walletRes.data.pay_url;

        // Return immediate response
        return res.status(202).json({
            success: true,
            message: 'Payment request accepted and queued for processing',
            redirectUrl,
        });
    } catch (error) {
        // Log detailed error info (including nested AggregateError from Axios)
        const errInfo = {
            message: error?.message,
            
            code: error?.code,
            url: error?.config?.url,
            method: error?.config?.method,
            requestHost: error?.request?._options?.hostname || error?.request?._options?.host,
            stack: error?.stack,
            errors: error?.errors || (error?.cause && error.cause.errors) || undefined,
        };
        console.error('Payment request error (detailed):', JSON.stringify(errInfo, null, 2));

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
        });
    }
}

async function successfullTransaction(req, res) {
    try {
        const { transaction_id:transactionId } = req.body || {};

        if (!transactionId) {
            return res.status(400).json({
                success: false,
                error: 'transactionId is required',
            });
        }

        const transaction = await Transaction.findOne({ transactionId });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found',
            });
        }
        transaction.status = 'completed';
        await transaction.save();

        await queueNotification.successTransaction({
            success: true,
            transactionId: transaction.transactionId,
            campaignId: transaction.campaignId,
            amount: transaction.amount,
        });

        console.log(`✅ Transaction Successful`)

        return res.status(200).json({
            success: true,
            message: 'Transaction marked as completed',
        });
    } catch (error) {
        console.error('Error:[Payment Successfull]:', error);

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
        });
    }
}

async function failureTransaction(req, res) {
    try {
        const { transaction_id:transactionId, failureReason } = req.body || {};

        if (!transactionId) {
            return res.status(400).json({
                success: false,
                error: 'transactionId is required',
            });
        }

        const transaction = await Transaction.findOne({ transactionId });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found',
            });
        }
        transaction.status = 'failed';
        await transaction.save();

        await queueNotification.failedTransaction({
            success: false,
            transactionId: transaction.transactionId,
            campaignId: transaction.campaignId,
            amount: transaction.amount,
            failureReason: failureReason || 'unknown',
        })

        console.log(`❌client Transaction Failed`)
        return res.status(200).json({
            success: true,
            message: 'Transaction marked as completed',
        });
    } catch (error) {
        console.error('Error:[Payment Failed]:', error.message);

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
        });
    }
}


module.exports = {
    processPaymentRequest,
    successfullTransaction,
    failureTransaction,
};
