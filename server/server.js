require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const passport = require("./config/passport");
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
const adminPromotionRouter = require("./routes/admin/promotion-routes");
const shopPromotionRouter = require("./routes/shop/promotion-routes");

const commonFeatureRouter = require("./routes/common/feature-routes");
const commonVideoRouter = require("./routes/common/video-routes");
const shopLookbookRouter = require("./routes/shop/lookbook-routes");

//create a database connection -> u can also
//create a separate file for this and then import/use that file here

// Database connection listeners
mongoose.connection.on("connected", () => console.log("Mongoose connected to DB"));
mongoose.connection.on("error", (err) => console.log("Mongoose connection error:", err));
mongoose.connection.on("disconnected", () => console.log("Mongoose disconnected"));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB initial connection success"))
  .catch((error) => console.log("MongoDB initial connection error:", error));

const app = express();
const PORT = process.env.PORT || 5000;

// Monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const elapsed = Date.now() - start;
    if (elapsed > 100) {
      console.log(`[PERF] ${req.method} ${req.originalUrl} - ${elapsed}ms`);
    }
  });
  next();
});


app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
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
app.use(passport.initialize());
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/analytics", adminAnalyticsRouter);
app.use("/api/admin/users", adminUserRouter);
app.use("/api/admin/lookbook", adminLookbookRouter);
app.use("/api/admin/videos", adminVideoRouter);
app.use("/api/admin/promotions", adminPromotionRouter);
app.use("/api/shop/promotions", shopPromotionRouter);

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
