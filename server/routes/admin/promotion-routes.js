const express = require("express");
const {
  createPromotion,
  updatePromotion,
  deletePromotion,
  getAllPromotions,
  getPromotionDetails,
  createVoucher,
  deleteVoucher
} = require("../../controllers/admin/promotion-controller");

const router = express.Router();

// Promotions API
router.post("/create", createPromotion);
router.put("/update/:id", updatePromotion);
router.delete("/delete/:id", deletePromotion);
router.get("/get", getAllPromotions);
router.get("/get/:id", getPromotionDetails);

// Vouchers API
router.post("/voucher/create", createVoucher);
router.delete("/voucher/delete/:id", deleteVoucher);

module.exports = router;
