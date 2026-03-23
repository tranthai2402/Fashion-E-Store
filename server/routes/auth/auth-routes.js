const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  updateUserProfile,
  changeUserPassword,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.post("/register", registerUser);
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

module.exports = router;
