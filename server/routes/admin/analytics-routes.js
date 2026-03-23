const express = require("express");

const {
  getRevenueAnalytics,
  getComparisonAnalytics,
} = require("../../controllers/admin/analytics-controller");

const router = express.Router();

router.get("/revenue", getRevenueAnalytics);
router.get("/comparison", getComparisonAnalytics);

module.exports = router;
