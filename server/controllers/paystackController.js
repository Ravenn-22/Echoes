const axios = require("axios");
const User = require("../models/User");
const Order = require("../models/Order");

// Server-side source of truth for print order pricing (NGN).
// The client never gets to choose what gets charged.
const PRINT_PRICES_NGN = {
  small: 52500,
  standard: 75000,
  premium: 97500,
};

const PENDING_WINDOW_MS = 30 * 60 * 1000;

const initializePayment = async (req, res) => {
  try {
    const { plan, email } = req.body;
    const isSubscription = plan === "monthly" || plan === "yearly";
    const isPrintOrder = ["print_small", "print_standard", "print_premium"].includes(plan);

    if (!isSubscription && !isPrintOrder) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    // ── Dedupe: if there's already a live pending transaction for this user,
    // send them back to that exact checkout instead of creating a second
    // Paystack transaction. This is what actually prevents two payable
    // checkout links from existing for the same purchase.
    const existingPending = await Order.findOne({
      user: req.user._id,
      isPending: true,
      createdAt: { $gte: new Date(Date.now() - PENDING_WINDOW_MS) },
    });

    if (existingPending && existingPending.authorizationUrl) {
      return res.status(200).json({
        data: {
          authorization_url: existingPending.authorizationUrl,
          reference: existingPending.paystackReference,
        },
        reused: true,
      });
    }

    let amountNGN = null;
    if (isPrintOrder) {
      const bookSize = plan.replace("print_", "");
      amountNGN = PRINT_PRICES_NGN[bookSize];
      if (!amountNGN) {
        return res.status(400).json({ message: "Invalid book size" });
      }
    }

    const payload = {
      email: email || req.user.email,
      // For print orders we send the real server-computed amount.
      // For subscriptions, Paystack bills using the plan code's own price;
      // this field is still required by their API but is not the source of
      // truth for what gets charged on a subscription.
      amount: isPrintOrder ? amountNGN * 100 : 100,
      metadata: {
        userId: req.user._id.toString(),
        plan,
      },
      callback_url: `${process.env.CLIENT_URL}/payment/verify`,
    };

    if (isSubscription) {
      payload.plan =
        plan === "monthly"
          ? process.env.PAYSTACK_MONTHLY_PLAN_CODE
          : process.env.PAYSTACK_YEARLY_PLAN_CODE;
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    );

    const { authorization_url, reference } = response.data.data;

    // ── For print orders, create the Order *here*, atomically with payment
    // initialization, instead of relying on a separate, trust-based
    // createPendingOrder call from the client afterwards.
    if (isPrintOrder) {
      const {
        scrapbookId,
        dedicationNote,
        coverStyle,
        bookStyle,
        shippingAddress,
        customCoverUrl,
      } = req.body;
      const bookSize = plan.replace("print_", "");

      if (!scrapbookId || !shippingAddress) {
        return res.status(400).json({ message: "Missing order details" });
      }

      await Order.create({
        user: req.user._id,
        scrapbook: scrapbookId,
        luluOrderId: "pending",
        bookSize,
        bookStyle: bookStyle || "polaroid",
        coverStyle,
        dedicationNote: dedicationNote || "",
        customCoverUrl: customCoverUrl || "",
        shippingAddress,
        amount: 0,
        expectedAmount: amountNGN,
        currency: "NGN",
        isPending: true,
        paystackReference: reference,
        authorizationUrl: authorization_url,
        status: "created",
      });
    }

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Paystack Error:", error.response?.data || error.message);
    res.status(500).json({ message: error.response?.data || error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      },
    );

    const { status, metadata, amount: paidAmountKobo } = response.data.data;

    if (status !== "success") {
      return res.status(400).json({ message: "Payment failed" });
    }

    if (!metadata || metadata.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Reference does not belong to this user" });
    }

    const { plan } = metadata;
    const isSubscription = plan === "monthly" || plan === "yearly";

    if (isSubscription) {
      // FIX: this branch — and ONLY this branch — touches isPro now.
      // Previously, User.isPro was set to true for every successful
      // payment of any kind, including print orders.
      const expiryDate = new Date();
      if (plan === "monthly") expiryDate.setMonth(expiryDate.getMonth() + 1);
      else expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      await User.updateOne(
        { _id: req.user._id },
        { $set: { isPro: true, proExpiresAt: expiryDate } },
      );

      return res.status(200).json({
        message: "Payment successful!",
        isPro: true,
        plan,
        proExpiresAt: expiryDate,
      });
    }

    // ── Print order payment: this is the single point where money is
    // actually confirmed and tied to a specific order.
    const order = await Order.findOne({
      user: req.user._id,
      paystackReference: reference,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found for this reference" });
    }

    if (!order.isPending) {
      // Already verified previously (refresh, double callback, etc).
      // Idempotent — does NOT re-credit or re-process anything.
      return res.status(200).json({ message: "Payment already verified", plan, order });
    }

    const paidAmountNGN = paidAmountKobo / 100;
    if (paidAmountNGN !== order.expectedAmount) {
      return res.status(400).json({
        message: "Amount paid does not match the expected order amount",
      });
    }

    order.isPending = false;
    order.amount = paidAmountNGN;
    order.verifiedAt = new Date();
    await order.save();

    res.status(200).json({ message: "Payment successful!", plan, order });
  } catch (error) {
    console.error("Paystack Error:", error.response?.data || error.message);
    res.status(500).json({ message: error.response?.data || error.message });
  }
};

module.exports = { initializePayment, verifyPayment };