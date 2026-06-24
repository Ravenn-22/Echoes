const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scrapbook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scrapbook",
      required: true,
    },
    luluOrderId: {
      type: String,
      required: true,
    },
    bookSize: {
      type: String,
      enum: ["small", "standard", "premium"],
      required: true,
    },
    bookStyle: {
      type: String,
      enum: ["polaroid", "magazine", "classic", "minimal"],
      required: true,
    },
    coverStyle: {
      type: String,
      required: true,
    },
    // NEW: these were previously only kept in localStorage and re-sent at
    // print time, which meant the server had no durable record of them.
    dedicationNote: {
      type: String,
      default: "",
    },
    customCoverUrl: {
      type: String,
      default: "",
    },
    amount: {
      // Actual amount confirmed paid via Paystack. Stays 0 until verified.
      type: Number,
      required: true,
      default: 0,
    },
    // NEW: amount we expect this order to be paid for, computed server-side
    // at initialization. verifyPayment checks the real Paystack-confirmed
    // amount against this before marking the order paid.
    expectedAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "NGN",
    },
    shippingAddress: {
      fullName: String,
      address: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    status: {
      type: String,
      enum: [
        "created",
        "in_production",
        "shipped",
        "delivered",
        "rejected",
        "cancelled",
      ],
      default: "created",
    },
    isPending: {
      type: Boolean,
      default: true,
    },
    paystackReference: {
      type: String,
      required: true,
    },
    // NEW: lets us resend the user back to the exact same checkout page
    // instead of generating a second Paystack transaction when they retry
    // within the pending window.
    authorizationUrl: {
      type: String,
    },
    // NEW: set the moment verifyPayment confirms the charge. Used to make
    // completePendingOrder safe — it now only succeeds if this is already set,
    // instead of blindly trusting whatever the client claims happened.
    verifiedAt: {
      type: Date,
      default: null,
    },
    estimatedDelivery: {
      type: String,
      default: "7-14 business days",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);