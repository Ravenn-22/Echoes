const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment } = require('../controllers/paystackController');
const { protect } = require('../middleware/authMiddleware');

router.post('/initialize', protect, initializePayment);
router.get('/verify/:reference', protect, verifyPayment);

module.exports = router;