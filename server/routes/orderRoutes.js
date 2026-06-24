const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getOrders,
  getOrder,
  completePendingOrder,
} = require("../controllers/orderController");

router.get("/", protect, getOrders);
router.get("/:id", protect, getOrder);

// NOTE: POST /pending (createPendingOrder) is removed — order creation now
// happens atomically inside paystackController.initializePayment.
// This route name is kept as "/pending/:reference" to match your existing
// frontend api.js call (API.put(`/orders/pending/${reference}`)) so you
// don't need to change that call site.
router.put("/pending/:reference", protect, completePendingOrder);

module.exports = router;