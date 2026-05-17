const mongoose = require("mongoose");

const PageSettingsSchema = new mongoose.Schema(
  {
    pageName: {
      type: String,
      required: true,
      unique: true, // e.g. "about", "services"
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // Stores structured JSON
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PageSettings", PageSettingsSchema);
