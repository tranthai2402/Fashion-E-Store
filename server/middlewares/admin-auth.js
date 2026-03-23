const ADMIN_ALLOWED_EMAILS = ["trantrongthai.aleri@gmail.com"];

const requireAdminRole = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }

  const isAdminRole = user.role === "admin";
  const isAllowedEmail = ADMIN_ALLOWED_EMAILS.includes(
    String(user.email || "").toLowerCase()
  );

  if (!isAdminRole && !isAllowedEmail) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: admin access required",
    });
  }

  next();
};

module.exports = {
  requireAdminRole,
};
