const express = require('express');
const router = express.Router();
const { createCapsule, getCapsules, getCapsule, deleteCapsule } = require('../controllers/timeCapsuleController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createCapsule);
router.get('/', protect, getCapsules);
router.get('/:id', protect, getCapsule);
router.delete('/:id', protect, deleteCapsule);

module.exports = router;