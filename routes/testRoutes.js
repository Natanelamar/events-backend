const express = require('express');
const router = express.Router();
const { sendPurchaseConfirmation } = require('../utils/emailService');

router.post('/test-email', async (req, res) => {
    try {
        // Test data
        const testPurchase = {
            id: "TEST-123",
            quantity: 2,
            totalAmount: 100
        };

        const testEvent = {
            title: "Test Event",
            date: new Date(),
            location: "Test Location"
        };

        await sendPurchaseConfirmation(
            "test@example.com",  // Test email address
            testPurchase,
            testEvent
        );

        res.status(200).json({
            status: 'success',
            message: 'Test email sent successfully. Check Mailtrap inbox.'
        });
    } catch (error) {
        console.error('Test email failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to send test email',
            error: error.message
        });
    }
});

module.exports = router;
