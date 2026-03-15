const axios = require('axios');
const User = require('../models/User');

const initializePayment = async (req, res) => {
    try {
        const { email, amount, plan } = req.body;

        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: amount * 100, // Paystack uses kobo
                metadata: {
                    userId: req.user._id,
                    plan
                },
                callback_url: `${process.env.CLIENT_URL}/payment/verify`
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params;

        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            }
        );

        const { status, metadata } = response.data.data;

        if (status === 'success') {
            const { userId, plan } = metadata;

            // Set pro expiry based on plan
            const expiryDate = new Date();
            if (plan === 'monthly') {
                expiryDate.setMonth(expiryDate.getMonth() + 1);
            } else if (plan === 'yearly') {
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            }

            await User.findByIdAndUpdate(userId, {
                isPro: true,
                proExpiresAt: expiryDate
            });

            res.status(200).json({ message: 'Payment successful!', isPro: true });
        } else {
            res.status(400).json({ message: 'Payment failed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { initializePayment, verifyPayment };