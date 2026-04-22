const express = require("express");
const {
  addOrUpdatePage,
  getAllPages,
  getPageBySlug,
  deletePage,
} = require("../../controllers/admin/page-controller");

const router = express.Router();

router.post("/save", addOrUpdatePage);
router.get("/get", getAllPages);
router.get("/get/:slug", getPageBySlug);
router.delete("/delete/:id", deletePage);

module.exports = router;
