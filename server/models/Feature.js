const mongoose = require("mongoose");

const FeatureSchema = new mongoose.Schema(
  {
    image: String,
    enabled: {
      type: Boolean,
      default: true,
    },
    lookbookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lookbook",
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feature", FeatureSchema);
