const mongoose = require("mongoose");

const NewsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    voucherCode: {
      type: String,
    },
    promotionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promotion",
    },
    isSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NewsletterSubscriber", NewsletterSubscriberSchema);
