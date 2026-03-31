const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    images: Array,
    title: String,
    description: String,
    category: String,
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    sizes: Array,
    colors: Array,
    colorImageMap: [
      {
        color: String,
        imageUrl: String,
      },
    ],
    averageReview: Number,
    totalSold: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    variants: [
      {
        size: String,
        color: String,
        stock: Number,
        price: Number,
        salePrice: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
