const express = require("express");
const { register, login, forgotPassword, verifyOtpByEmail, verifyOtpByMobile, resetPassword } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware"); // IMPORTANT
const passport = require("passport");

const router = express.Router();

// Register API
router.post("/register", register);

// Login API
router.post("/login", login);

// Forgot Password (send OTP / add alternate)
router.post("/forgot-password", forgotPassword);

// Verify otp by email
router.post("/verify-otp-email", verifyOtpByEmail);
 
// verify otp by mobile
router.post("/verify-otp-mobile", verifyOtpByMobile);

// reset password
router.post("/reset-password", resetPassword);

// Protected Route
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected data",
    user: req.user
  });
});
// ================= GOOGLE AUTH =================

// Google Login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google Callback
router.get(
  "/google/callback",

  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/signup",
    session: false,
  }),
  async (req, res) => {

  if (req.user.isNewUser) {
    return res.redirect("http://localhost:3000/login");
  }

  return res.redirect("http://localhost:3000/landing");
}
);
module.exports = router;