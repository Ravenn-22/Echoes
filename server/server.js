const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const https = require("https");
const { init } = require("./config/socket");
require("dotenv").config();
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const scrapbookRoutes = require("./routes/scrapBookRoutes");
const memoryRoutes = require("./routes/memoryRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const paystackRoutes = require("./routes/paystackRoutes");
const printRoutes = require("./routes/printRoutes");
const timeCapsuleRoutes = require("./routes/timeCapsulesRoutes");
const orderRoutes = require("./routes/orderRoutes");

const checkProExpiry = require("./middleware/checkProExpiry");
const { checkAndUnlockCapsules } = require("./controllers/timeCapsuleController");
const User = require("./models/User");
const Order = require("./models/Order");
const { sendSubscriptionReminderEmail, sendShippingEmail } = require("./config/email");

const app = express();
connectDB();
const server = http.createServer(app);
const io = init(server);

// ─── CORS 
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// ─── LULU WEBHOOK 
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
          { new: true }
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
              luluOrderId
            );
          } catch (emailError) {
            console.error("Shipping email error:", emailError.message);
          }
        }
      }
    } catch (error) {
      console.error("Webhook processing error:", error.message);
    }
  }
);

// ─── BODY PARSER 
app.use(express.json());

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
          user.proExpiresAt
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
setInterval(async () => {
  await checkExpiringSubscriptions();
}, 24 * 60 * 60 * 1000);

// Check time capsules every hour
setInterval(async () => {
  console.log("Checking for capsules to unlock...");
  await checkAndUnlockCapsules();
}, 60 * 60 * 1000);

// ─── SERVER 
const PORT = process.env.PORT || 3007;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Keep Render from spinning down (every 14 mins)
setInterval(() => {
  https
    .get("https://echoes-j0mn.onrender.com", () => {
      console.log("Keep alive ping sent");
    })
    .on("error", (err) => {
      console.log("Keep alive error:", err.message);
    });
}, 14 * 60 * 1000);