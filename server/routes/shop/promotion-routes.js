const express = require("express");
const { getPublicVouchers } = require("../../controllers/shop/promotion-controller");

const router = express.Router();

router.get("/vouchers/public", getPublicVouchers);

module.exports = router;
