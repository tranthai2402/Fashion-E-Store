const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: String,
  orderCode: {
    type: String,
    index: true,
    unique: true,
    sparse: true,
  },
  cartId: String,
  cartItems: [
    {
      productId: String,
      variantId: String,
      title: String,
      image: String,
      price: String,
      quantity: Number,
      size: String,
      color: String,
    },
  ],
  addressInfo: {
    addressId: String,
    address: String,
    city: String,
    pincode: String,
    phone: String,
    notes: String,
  },
  orderStatus: String,
  paymentMethod: String,
  paymentStatus: String,
  totalAmount: Number,
  orderDate: Date,
  orderUpdateDate: Date,
  paymentId: String,
  payerId: String,
  stockReserved: {
    type: Boolean,
    default: false,
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  appliedPromotions: [
    {
      promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' },
      name: String,
      discountAmount: Number,
      voucherCode: String,
      productBreakdown: [
        {
          productId: String,
          size: String,
          color: String,
          discountAmount: Number
        }
      ]
    }
  ]
});

module.exports = mongoose.model("Order", OrderSchema);
