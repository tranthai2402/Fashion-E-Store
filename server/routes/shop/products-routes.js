const express = require("express");

const {
  getFilteredProducts,
  getProductDetails,
  getBestSellingProducts,
  getSaleProducts,
} = require("../../controllers/shop/products-controller");

const router = express.Router();

router.get("/get", getFilteredProducts);
router.get("/best-selling", getBestSellingProducts);
router.get("/sale-products", getSaleProducts);
router.get("/get/:id", getProductDetails);

module.exports = router;
