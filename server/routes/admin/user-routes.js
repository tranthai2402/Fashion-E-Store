const express = require("express");
const { getAllUsers, updateUserRole, deleteUser } = require("../../controllers/admin/user-controller");

const router = express.Router();

router.get("/get", getAllUsers);
router.put("/update-role", updateUserRole);
router.delete("/delete/:userId", deleteUser);

module.exports = router;
