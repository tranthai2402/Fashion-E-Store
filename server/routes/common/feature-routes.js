const express = require("express");

const {
  addFeatureImage,
  getFeatureImages,
  updateFeatureImageStatus,
  deleteFeatureImage,
} = require("../../controllers/common/feature-controller");

const router = express.Router();

router.post("/add", addFeatureImage);
router.get("/get", getFeatureImages);
router.patch("/update-status/:id", updateFeatureImageStatus);
router.delete("/delete/:id", deleteFeatureImage);

module.exports = router;
