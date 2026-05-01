const express = require('express');
const router = express.Router();
const { getOrders, getOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);

module.exports = router;