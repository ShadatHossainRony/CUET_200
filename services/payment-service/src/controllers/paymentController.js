const { default: axios } = require('axios');
const Transaction = require('../models/Transaction');
const { queueNotification } = require('../config/queue');

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

        const walletRes = await axios.post("http://localhost:9001/wallet/pay", { amount })
        console.log(JSON.stringify(walletRes.data));

        let metadata = {}
        const user = req.user;
        if (user) {
            metadata.userId = Date.now().toString();
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
    } catch (err) {
        console.error('Payment request error:', err);

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: err.message,
        });
    }
}

async function successfullTransaction(req, res) {
    try {
        const { transactionId } = req.body()
        const transaction = await Transaction.findOne({ transactionId });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found',
            });
        }
        transaction.status = 'completed';
        await transaction.save();

        queueNotification.successTransaction({
            success: true,
            transactionId: transaction.transactionId,
            campaignId: transaction.campaignId,
            amount: transaction.amount,
        })

        return res.status(200).json({
            success: true,
            message: 'Transaction marked as completed',
        });
    } catch (error) {
        console.error('Error:[Payment Successfull]:', err);

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: err.message,
        });
    }
}

async function failureTransaction(req, res) {
    try {
        const { transactionId } = req.body()
        const transaction = await Transaction.findOne({ transactionId });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found',
            });
        }
        transaction.status = 'failed';
        await transaction.save();

        queueNotification.failedTransaction({
            success: false,
            transactionId: transaction.transactionId,
        })
        return res.status(200).json({
            success: true,
            message: 'Transaction marked as completed',
        });
    } catch (error) {
        console.error('Error:[Payment Failed]:', err);

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: err.message,
        });
    }
}


module.exports = {
    processPaymentRequest,
    successfullTransaction,
    failureTransaction,
};
