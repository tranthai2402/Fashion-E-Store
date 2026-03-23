const express = require("express");
const {
  getLookbookList,
  getLookbookDetails,
} = require("../../controllers/shop/lookbook-controller");

const router = express.Router();

router.get("/get", getLookbookList);
router.get("/get/:id", getLookbookDetails);

module.exports = router;
