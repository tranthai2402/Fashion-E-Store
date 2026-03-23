const express = require("express");
const { getAllUsers, updateUserRole } = require("../../controllers/admin/user-controller");

const router = express.Router();

router.get("/get", getAllUsers);
router.put("/update-role", updateUserRole);

module.exports = router;
