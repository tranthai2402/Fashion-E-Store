const mongoose = require("mongoose");

const VoucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    promotionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promotion",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true, // Visible to all users in a list, vs hidden secret codes
    },
    usageLimit: {
      type: Number, // Total times this specific code can be used
      default: null, // Unlimited
    },
    usagePerUser: {
      type: Number,
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },
    restrictedToEmail: {
      type: String, // If set, only users with this email can use this voucher
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voucher", VoucherSchema);
