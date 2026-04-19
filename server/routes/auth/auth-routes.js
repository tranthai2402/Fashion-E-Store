const express = require("express");
const passport = require("passport");
const {
  registerUser,
  verifyUser,
  verifyLink,
  loginUser,
  logoutUser,
  authMiddleware,
  updateUserProfile,
  changeUserPassword,
  googleAuthCallback,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify", verifyUser);
router.get("/verify-link", verifyLink);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});
router.put("/profile", authMiddleware, updateUserProfile);
router.put("/change-password", authMiddleware, changeUserPassword);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/auth/login?error=google_auth_failed",
    session: false,
  }),
  googleAuthCallback
);

module.exports = router;
