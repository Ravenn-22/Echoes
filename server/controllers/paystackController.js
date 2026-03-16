const axios = require('axios');
const User = require('../models/User');

const initializePayment = async (req, res) => {
    try {
        const { email, amount, plan } = req.body;

        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: amount * 100, 
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
                },
                timeout: 10000
            }
        );

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Paystack Error:', error.response?.data || error.message)
        res.status(500).json({ message:  error.response?.data || error.message });
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
        console.log ('Payment Status:', status)
        console.log ('Metadata:', metadata);
        console.log ('User ID from metadata:', metadata?.userId);

        if (status === 'success') {
            const { userId, plan } = metadata;

            
            const expiryDate = new Date();
            if (plan === 'monthly') {
                expiryDate.setMonth(expiryDate.getMonth() + 1);
            } else if (plan === 'yearly') {
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            }

            const updatedUser = await User.findByIdAndUpdate(userId, {
                isPro: true,
                proExpiresAt: expiryDate
            },{new:true});
            console.log('Updated user:', updatedUser?.isPro, updatedUser?.proExpiresAt)
            res.status(200).json({ message: 'Payment successful!', isPro: true });
        } else {
            res.status(400).json({ message: 'Payment failed' });
        }
    } catch (error) {
        console.error('Paystack Error:', error.response?.data || error.message)
        res.status(500).json({ message:  error.response?.data || error.message });
    }
};

module.exports = { initializePayment, verifyPayment };