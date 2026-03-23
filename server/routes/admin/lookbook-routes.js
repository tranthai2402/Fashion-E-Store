const express = require("express");
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const { requireAdminRole } = require("../../middlewares/admin-auth");
const {
  addLookbook,
  getAllLookbooksForAdmin,
  deleteLookbook,
} = require("../../controllers/admin/lookbook-controller");

const router = express.Router();

router.use(authMiddleware, requireAdminRole);

router.post("/add", addLookbook);
router.get("/get", getAllLookbooksForAdmin);
router.delete("/delete/:id", deleteLookbook);

module.exports = router;
