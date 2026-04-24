const express = require("express");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  capturePayment,
  checkProductPurchase,
  handlePaymentWebhook,
  cancelOrder
} = require("../../controllers/shop/order-controller");

const router = express.Router();

router.post("/create", createOrder);
router.post("/capture", capturePayment);
router.put("/cancel/:id", cancelOrder);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);
router.get("/check-purchase/:userId/:productId", checkProductPurchase);

// Webhook for automated payment verification (e.g., from SePay, PayOS, Casso)
router.post("/webhook/payment", handlePaymentWebhook);

module.exports = router;

