const express = require("express");
const router = express.Router();
const User = require("../models/User"); // FIX: was missing — verify-email threw a ReferenceError every time
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updateProfilePicture,
  updateUsername,
  changePassword,
} = require("../controllers/authControllers");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.get("/verify-email/:token", async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return res.status(400).json({ message: "Invalid verification token" });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.redirect(`${process.env.CLIENT_URL}/auth?verified=true`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put("/reset-password/:token", resetPassword);
router.put("/update-profile-picture", protect, updateProfilePicture);
router.put("/update-username", protect, updateUsername);
router.put("/change-password", protect, changePassword);

module.exports = router;