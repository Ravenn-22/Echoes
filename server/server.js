const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const https = require("https");
const { init } = require("./config/socket");
require("dotenv").config();
const connectDB = require("./config/db");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const scrapbookRoutes = require("./routes/scrapBookRoutes");
const memoryRoutes = require("./routes/memoryRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const paystackRoutes = require("./routes/paystackRoutes");
const printRoutes = require("./routes/printRoutes");
const timeCapsuleRoutes = require("./routes/timeCapsulesRoutes");
const orderRoutes = require("./routes/orderRoutes");

const checkProExpiry = require("./middleware/checkProExpiry");
const {
  checkAndUnlockCapsules,
} = require("./controllers/timeCapsuleController");
const User = require("./models/User");
const Order = require("./models/Order");
const {
  sendSubscriptionReminderEmail,
  sendShippingEmail,
} = require("./config/email");

const app = express();
connectDB();
const server = http.createServer(app);
const io = init(server);

// ─── CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);





// Paystack Webhook
app.post(
  "/api/webhooks/paystack",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const event = JSON.parse(req.body);
      console.log("Paystack webhook:", event.event);

      // WHY: Right now, the webhook only updates User.isPro for charge.success.
      // It never looks at Order at all. If a user pays for a print order but
      // closes the browser tab before /payment/verify finishes running, the
      // Order stays isPending: true forever, even though Paystack was paid.
      // This patch makes the webhook a backup confirmation path for print orders,
      // using the same ownership + amount checks as verifyPayment, and is
      // idempotent so it's safe even if verifyPayment already processed it first.

      if (event.event === "charge.success") {
        const { metadata, reference, amount } = event.data;
        const { userId, plan } = metadata || {};

        if (userId && (plan === "monthly" || plan === "yearly")) {
          const expiryDate = new Date();
          if (plan === "monthly") {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
          } else {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          }

          await User.updateOne(
            { _id: userId },
            { $set: { isPro: true, proExpiresAt: expiryDate } },
          );
          console.log(`Pro renewed for user: ${userId}`);
        } else if (userId && reference) {
          // Print order backup reconciliation — mirrors verifyPayment's checks.
          const order = await Order.findOne({
            user: userId,
            paystackReference: reference,
          });

          if (order && order.isPending) {
            const paidAmountNGN = amount / 100;
            if (paidAmountNGN === order.expectedAmount) {
              order.isPending = false;
              order.amount = paidAmountNGN;
              order.verifiedAt = new Date();
              await order.save();
              console.log(
                `Order ${order._id} confirmed via webhook (reference: ${reference})`,
              );
            } else {
              console.warn(
                `Webhook amount mismatch for order ${order._id}: expected ${order.expectedAmount}, got ${paidAmountNGN}`,
              );
            }
          }
          // If order is already !isPending, this is a no-op — already handled by
          // verifyPayment. Safe to receive both.
        }
      }

      if (event.event === "subscription.disable") {
        const { customer } = event.data;
        await User.updateOne(
          { email: customer.email },
          { $set: { isPro: false, proExpiresAt: null } },
        );
        console.log(`Pro cancelled for: ${customer.email}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Paystack webhook error:", error.message);
      res.status(500).json({ message: error.message });
    }
  },
);

//  LULU WEBHOOK
app.post(
  "/api/webhooks/lulu",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    //  token verification
    const token = req.query.token;
    if (token !== process.env.LULU_WEBHOOK_TOKEN) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Acknowledge immediately
    res.status(200).json({ received: true });

    try {
      const event = JSON.parse(req.body);
      console.log("Lulu webhook received:", JSON.stringify(event, null, 2));

      const { topic, data } = event;

      if (topic === "PRINT_JOB_STATUS_CHANGED") {
        const luluOrderId = data.id.toString();
        const newStatus = data.status?.name?.toLowerCase();

        const statusMap = {
          payment_success: "created",
          production_ready: "in_production",
          in_production: "in_production",
          error: "rejected",
          shipped: "shipped",
          delivered: "delivered",
          cancelled: "cancelled",
        };

        const mappedStatus = statusMap[newStatus];
        if (!mappedStatus) return;

        const order = await Order.findOneAndUpdate(
          { luluOrderId },
          { status: mappedStatus },
          { new: true },
        ).populate("user", "email username");

        if (!order) {
          console.warn(`No order found for luluOrderId: ${luluOrderId}`);
          return;
        }

        console.log(`Order ${luluOrderId} status updated to ${mappedStatus}`);

        if (mappedStatus === "shipped") {
          try {
            await sendShippingEmail(
              order.user.email,
              order.user.username,
              luluOrderId,
            );
          } catch (emailError) {
            console.error("Shipping email error:", emailError.message);
          }
        }
      }
    } catch (error) {
      console.error("Webhook processing error:", error.message);
    }
  },
);

// ─── BODY PARSER
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per 15 minutes
  message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // stricter limit for auth routes
  message: { message: "Too many login attempts, please try again later." },
});

app.use("/api/", limiter);
app.use("/api/auth", authLimiter);

// ─── ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/scrapbooks", scrapbookRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/upload", uploadRoutes);
app.use("/api/paystack", paystackRoutes);
app.use(checkProExpiry);
app.use("/temp", express.static("/tmp"));
app.use("/api/print", printRoutes);
app.use("/api/capsules", timeCapsuleRoutes);
app.use("/api/orders", orderRoutes);

// ─── SOCKET.IO
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("joinScrapbook", (scrapbookId) => {
    socket.join(scrapbookId);
    console.log(`User joined scrapbook: ${scrapbookId}`);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ─── ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

// ─── SCHEDULED JOBS
const checkExpiringSubscriptions = async () => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const expiringUsers = await User.find({
      isPro: true,
      proExpiresAt: { $lte: threeDaysFromNow, $gte: new Date() },
    });

    for (const user of expiringUsers) {
      try {
        await sendSubscriptionReminderEmail(
          user.email,
          user.username,
          user.proExpiresAt,
        );
        console.log(`Reminder sent to: ${user.email}`);
      } catch (emailError) {
        console.error("Reminder email error:", emailError.message);
      }
    }
  } catch (error) {
    console.error("Subscription check error:", error.message);
  }
};

// Check subscriptions every 24 hours
setInterval(
  async () => {
    await checkExpiringSubscriptions();
  },
  24 * 60 * 60 * 1000,
);

// Check time capsules every hour
setInterval(
  async () => {
    console.log("Checking for capsules to unlock...");
    await checkAndUnlockCapsules();
  },
  60 * 60 * 1000,
);

// ─── SERVER
const PORT = process.env.PORT || 3007;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Keep Render from spinning down (every 14 mins)
setInterval(
  () => {
    https
      .get("https://echoes-j0mn.onrender.com", () => {
        console.log("Keep alive ping sent");
      })
      .on("error", (err) => {
        console.log("Keep alive error:", err.message);
      });
  },
  14 * 60 * 1000,
);
