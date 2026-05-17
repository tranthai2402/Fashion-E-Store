const express = require("express");
const { getAllEmails, deleteSubscriber } = require("../../controllers/admin/newsletter-controller");

const router = express.Router();

router.get("/all-emails", getAllEmails);
router.delete("/subscriber/:email", deleteSubscriber);

module.exports = router;
