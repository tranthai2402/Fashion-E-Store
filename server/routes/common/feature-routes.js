const express = require("express");

const {
  addFeatureImage,
  getFeatureImages,
  updateFeatureImageStatus,
  deleteFeatureImage,
  reorderFeatureImages,
} = require("../../controllers/common/feature-controller");

const router = express.Router();

router.post("/add", addFeatureImage);
router.get("/get", getFeatureImages);
router.patch("/update-status/:id", updateFeatureImageStatus);
router.delete("/delete/:id", deleteFeatureImage);
router.put("/reorder", reorderFeatureImages);

module.exports = router;
