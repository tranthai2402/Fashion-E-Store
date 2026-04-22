const express = require("express");
const {
  savePageSettings,
  getPageSettings,
} = require("../../controllers/admin/page-settings-controller");

const router = express.Router();

router.post("/save", savePageSettings);
router.get("/get/:pageName", getPageSettings);

module.exports = router;
