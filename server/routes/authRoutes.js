const express = require("express");
const router = express.Router();
const User = require("../models/User"); // was missing — verify-email threw a ReferenceError without this
const {
  registerUser,
  loginUser,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  updateProfilePicture,
  updateUsername,
  changePassword,
} = require("../controllers/authControllers");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);

router.get("/verify-email/:token", async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    // FIX: tokens now expire (1 hour, set at registration/resend). An old
    // link sitting in someone's inbox stops working once a fresher one has
    // been issued or the window passes — they just need to hit resend.
    if (user.verificationTokenExpire && user.verificationTokenExpire < Date.now()) {
      return res.status(400).json({
        message: "This verification link has expired. Please request a new one.",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
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