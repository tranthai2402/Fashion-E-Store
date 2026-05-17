const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    type: {
      type: String,
      enum: ["flash_sale", "seasonal", "automatic", "code_based"],
      default: "automatic",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
      description: "Higher number means higher priority when resolving conflicts",
    },
    stackable: {
      type: Boolean,
      default: false,
      description: "Can be used along with other promotions",
    },
    status: {
      type: String,
      enum: ["draft", "active", "expired", "disabled"],
      default: "draft",
    },
    // Condition configuration
    conditions: {
      minOrderValue: { type: Number, default: 0 },
      minQuantity: { type: Number, default: 0 },
      applicableProducts: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      ],
      applicableCategories: [{ type: String }],
      targetAudience: {
        type: String,
        enum: ["all", "new_user", "vip"],
        default: "all",
      },
    },
    // Action configuration
    action: {
      discountType: {
        type: String,
        enum: ["percentage", "fixed_amount", "free_shipping"],
        required: true,
      },
      discountValue: {
        type: Number,
        required: true,
        default: 0,
      },
      maxDiscountAmount: {
        type: Number, // Cap max savings for percentage discount
      },
    },
    // Tracking
    usageLimit: {
      type: Number, // 0 or null means unlimited
      default: null,
    },
    usagePerUser: {
      type: Number, // 0 or null means unlimited
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Promotion", PromotionSchema);
