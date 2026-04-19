const express = require("express");
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const { requireAdminRole } = require("../../middlewares/admin-auth");
const {
  addLookbook,
  updateLookbook,
  getAllLookbooksForAdmin,
  deleteLookbook,
  reorderLookbooks,
} = require("../../controllers/admin/lookbook-controller");

const router = express.Router();

router.use(authMiddleware, requireAdminRole);

router.post("/add", addLookbook);
router.put("/update/:id", updateLookbook);
router.get("/get", getAllLookbooksForAdmin);
router.delete("/delete/:id", deleteLookbook);
router.put("/reorder", reorderLookbooks);

module.exports = router;
