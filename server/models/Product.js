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
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isSaleItem: {
      type: Boolean,
      default: false,
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

ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ title: "text", description: "text" }); // For keyword search

module.exports = mongoose.model("Product", ProductSchema);
