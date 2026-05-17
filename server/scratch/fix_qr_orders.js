const mongoose = require("mongoose");
require("dotenv").config();
const Order = require("../models/Order");

async function fixQrOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // We only want to subtract 2000 from QR orders that actually have the fee.
    // Since we just added the fee logic, we can target recent orders or just check if totalAmount >= 2000.
    // However, to be safe, we'll only update QR orders.
    const result = await Order.updateMany(
      { paymentMethod: "qr_code", totalAmount: { $gte: 2000 } },
      { $inc: { totalAmount: -2000 } }
    );

    console.log(`Updated ${result.modifiedCount} QR orders.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixQrOrders();
