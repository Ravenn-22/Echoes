const express = require('express');
const router = express.Router();
const { createPrintOrder } = require('../controllers/printController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createPrintOrder);

module.exports = router;