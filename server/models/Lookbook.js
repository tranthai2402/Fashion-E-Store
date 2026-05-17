const mongoose = require("mongoose");

const LookbookSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lookbook", LookbookSchema);
