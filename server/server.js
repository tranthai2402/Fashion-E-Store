const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");

const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const adminAnalyticsRouter = require("./routes/admin/analytics-routes");
const adminUserRouter = require("./routes/admin/user-routes");
const adminLookbookRouter = require("./routes/admin/lookbook-routes");
const adminVideoRouter = require("./routes/admin/video-routes");

const commonFeatureRouter = require("./routes/common/feature-routes");
const commonVideoRouter = require("./routes/common/video-routes");
const shopLookbookRouter = require("./routes/shop/lookbook-routes");

//create a database connection -> u can also
//create a separate file for this and then import/use that file here

const MONGODB_URI = process.env.MONGODB_URI;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in environment variables");
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/analytics", adminAnalyticsRouter);
app.use("/api/admin/users", adminUserRouter);
app.use("/api/admin/lookbook", adminLookbookRouter);
app.use("/api/admin/videos", adminVideoRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/shop/lookbook", shopLookbookRouter);

app.use("/api/common/feature", commonFeatureRouter);
app.use("/api/common/videos", commonVideoRouter);

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
