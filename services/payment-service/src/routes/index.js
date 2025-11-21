const express = require('express');
const router = express.Router();
const {
    processPaymentRequest,
    successfullTransaction,
    failureTransaction,
} = require('../controllers/paymentController');

router.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'payment-service' });
});

// Payment endpoints
router.post('/payment/process', processPaymentRequest);
router.patch('/payment/success', successfullTransaction);
router.patch('/payment/fail', failureTransaction);

module.exports = router;
