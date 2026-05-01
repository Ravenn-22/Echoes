const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scrapbook: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scrapbook',
        required: true
    },
    luluOrderId: {
        type: String,
        required: true
    },
    bookSize: {
        type: String,
        enum: ['small', 'standard', 'premium'],
        required: true
    },
    bookStyle: {
        type: String,
        enum: ['polaroid', 'magazine', 'classic', 'minimal'],
        required: true
    },
    coverStyle: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    shippingAddress: {
        fullName: String,
        address: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    status: {
        type: String,
        enum: ['created', 'in_production', 'shipped', 'delivered', 'rejected', 'cancelled'],
        default: 'created'
    },
    estimatedDelivery: {
        type: String,
        default: '7-14 business days'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);