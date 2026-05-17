const express = require("express");
const { getPageBySlug } = require("../../controllers/admin/page-controller");

const router = express.Router();

router.get("/get/:slug", getPageBySlug);

module.exports = router;
