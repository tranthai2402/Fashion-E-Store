const express = require("express");
const { subscribeNewsletter } = require("../../controllers/shop/newsletter-controller");

const router = express.Router();

router.post("/subscribe", subscribeNewsletter);

module.exports = router;
