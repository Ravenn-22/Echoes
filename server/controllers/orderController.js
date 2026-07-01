const Order = require("../models/Order");

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("scrapbook", "title coverImage")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("scrapbook", "title coverImage")
      .populate("user", "username email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user._id.toString() !== req.user._id.toString()) {
      // 403, not 401 — the user IS authenticated, they just don't own this order.
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NOTE: createPendingOrder has been removed. Order creation now happens
// atomically inside paystackController.initializePayment, so there's no
// window where a payment exists without a matching order (or vice versa),
// and no separate trust-based step where the client tells the server what
// the order should contain.

const completePendingOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      user: req.user._id,
      paystackReference: req.params.reference,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // FIX: this used to unconditionally set isPending: false based purely on
    // a client-supplied reference, with no proof payment ever happened.
    // Now it only succeeds if verifyPayment has already confirmed the charge
    // (order.isPending is flipped there, and only there, after checking
    // status + ownership + amount against Paystack directly).
    if (order.isPending) {
      return res.status(400).json({
        message: "Payment has not been verified yet. Verify the payment before completing the order.",
      });
    }

    res.status(200).json({ message: "Order completed", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getOrders, getOrder, completePendingOrder };