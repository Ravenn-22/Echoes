const express = require("express");
const router = express.Router();
const { registerUser , loginUser, forgotPassword, resetPassword, updateProfilePicture, updateUsername } = require('../controllers/authControllers');
const { protect } = require('../middleware/authMiddleware');


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/update-profile-picture', protect, updateProfilePicture);
export const updateUsername = (username) => API.put('/auth/update-username', { username });
module.exports = router