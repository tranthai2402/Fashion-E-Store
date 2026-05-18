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
const CLIENT_ORIGIN = process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || "http://localhost:5173";
const googleAuthEnabled =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);

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
  (req, res, next) => {
    if (!googleAuthEnabled) {
      return res.status(503).json({
        success: false,
        message: "Google OAuth is not configured on server",
      });
    }
    return next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    if (!googleAuthEnabled) {
      return res.redirect(`${CLIENT_ORIGIN}/auth/login?error=google_not_configured`);
    }
    return next();
  },
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_ORIGIN}/auth/login?error=google_auth_failed`,
    session: false,
  }),
  googleAuthCallback
);

module.exports = router;
