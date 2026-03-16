const axios = require('axios');
const User = require('../models/User');
const mongoose = require('mongoose')

const initializePayment = async (req, res) => {
    try {
        const { email, amount, plan } = req.body;

        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: amount * 100, 
                metadata: {
                    userId: req.user._id.toString(),
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
         console.log('Full payment data:', JSON.stringify(response.data,null,2))

        const { status, metadata, customer } = response.data.data;
        console.log ('Payment Status:', status)
        console.log ('Metadata:', metadata);
        console.log ('Customer:', customer);
       

       if (status === 'success') {
    const {plan } = metadata;

    const expiryDate = new Date();
    if (plan === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (plan === 'yearly') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    await User.updateOne(
        {_id:req.user._id},
        {$set: {isPro: true, proExpiresAt: expiryDate}}
    )

    const updatedUser = await User.findById(req.user._id);
    console.log('Updated user isPro:', updatedUser?.isPro);
    console.log('Updated user proExpiresAt:', updatedUser?.proExpiresAt);

    res.status(200).json({ message: 'Payment successful!', 
        isPro: true ,
        proExpiresAt: req.user.proExpiresAt
    
    });

        } else {
            res.status(400).json({ message: 'Payment failed' });
        }
    } catch (error) {
        console.error('Paystack Error:', error.response?.data || error.message)
        res.status(500).json({ message:  error.response?.data || error.message });
    }
};

module.exports = { initializePayment, verifyPayment };