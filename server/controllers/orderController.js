const Order = require('../models/Order');

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('scrapbook', 'title coverImage')
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('scrapbook', 'title coverImage')
            .populate('user', 'username email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getOrders, getOrder };