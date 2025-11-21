const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
    {
        transactionId: { type: String, unique: true, index: true },
        campaignId: { type: String, required: true },
        amount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
        },
        metadata: {
            pledgeId: { type: String, required: false },
            userId: { type: String, required: false },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
