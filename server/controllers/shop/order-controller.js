const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? require("stripe")(stripeSecretKey) : null;

const ORDER_CODE_PREFIX = "ORD";
const ORDER_CODE_RANDOM_LENGTH = 6;
const ORDER_CODE_MAX_ATTEMPTS = 5;
const ORDER_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function formatDateYYMMDD(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return formatDateYYMMDD(new Date());
  }

  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function generateRandomCode(length = ORDER_CODE_RANDOM_LENGTH) {
  let output = "";
  for (let i = 0; i < length; i += 1) {
    const idx = Math.floor(Math.random() * ORDER_CODE_CHARS.length);
    output += ORDER_CODE_CHARS[idx];
  }
  return output;
}

function buildOrderCode(orderDate) {
  const datePart = formatDateYYMMDD(orderDate);
  const randomPart = generateRandomCode();
  return `${ORDER_CODE_PREFIX}-${datePart}-${randomPart}`;
}

async function createUniqueOrderCode(orderDate) {
  for (let attempt = 0; attempt < ORDER_CODE_MAX_ATTEMPTS; attempt += 1) {
    const code = buildOrderCode(orderDate);
    const exists = await Order.findOne({ orderCode: code })
      .select("_id")
      .lean();

    if (!exists) return code;
  }

  return buildOrderCode(orderDate);
}

async function ensureOrderCode(order) {
  if (!order || order.orderCode) return order;
  order.orderCode = await createUniqueOrderCode(order.orderDate);
  await order.save();
  return order;
}

async function reserveStockForItems(items = [], options = {}) {
  const { session } = options;

  for (const item of items) {
    const quantity = Number(item?.quantity) || 0;
    const productId = item?.productId;
    const size = String(item?.size || "").trim();
    const color = String(item?.color || "").trim();

    if (!productId || quantity <= 0) {
      throw new Error("Invalid cart item data");
    }

    const product = await Product.findById(productId).session(session || null);
    if (!product) {
      throw new Error("Product not found");
    }

    const hasVariants =
      Array.isArray(product.variants) && product.variants.length > 0;

    if (hasVariants) {
      if (!size || !color) {
        throw new Error("Please select size and color before checkout");
      }

      const updatedVariantProduct = await Product.findOneAndUpdate(
        {
          _id: productId,
          totalStock: { $gte: quantity },
          variants: {
            $elemMatch: {
              size,
              color,
              stock: { $gte: quantity },
            },
          },
        },
        {
          $inc: {
            "variants.$.stock": -quantity,
            totalStock: -quantity,
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedVariantProduct) {
        throw new Error(
          `Insufficient stock for ${item?.title || "selected variant"}`
        );
      }

      continue;
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, totalStock: { $gte: quantity } },
      { $inc: { totalStock: -quantity } },
      { new: true, session }
    );

    if (!updatedProduct) {
      throw new Error(`Insufficient stock for ${item?.title || "product"}`);
    }
  }
}

async function releaseReservedStock(items = []) {
  for (const item of items) {
    const quantity = Number(item?.quantity) || 0;
    const productId = item?.productId;
    const size = String(item?.size || "").trim();
    const color = String(item?.color || "").trim();

    if (!productId || quantity <= 0) continue;

    const product = await Product.findById(productId).select("variants");
    const hasVariants =
      Array.isArray(product?.variants) && product.variants.length > 0;

    if (hasVariants && size && color) {
      await Product.findOneAndUpdate(
        {
          _id: productId,
          variants: {
            $elemMatch: {
              size,
              color,
            },
          },
        },
        {
          $inc: {
            "variants.$.stock": quantity,
            totalStock: quantity,
          },
        }
      );
      continue;
    }

    await Product.findByIdAndUpdate(productId, {
      $inc: { totalStock: quantity },
    });
  }
}

const Voucher = require("../../models/Voucher");
const Promotion = require("../../models/Promotion");

const createOrder = async (req, res) => {
  try {
    const {
      userId, cartItems, addressInfo, orderStatus, totalAmount,
      orderDate, orderUpdateDate, cartId, discountAmount, appliedPromotions
    } = req.body;

    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe secret key is not configured on server",
      });
    }

    if (!userId || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order data",
      });
    }

    const orderCode = await createUniqueOrderCode(orderDate);
    let stripeSession = null;
    let newlyCreatedOrder = null;
    const reservedItems = [];

    try {
      for (const cartItem of cartItems) {
        await reserveStockForItems([cartItem]);
        reservedItems.push(cartItem);
      }

      newlyCreatedOrder = new Order({
        userId,
        orderCode,
        cartId,
        cartItems,
        addressInfo,
        orderStatus,
        paymentMethod: "stripe",
        paymentStatus: "pending",
        totalAmount,
        orderDate,
        orderUpdateDate,
        stockReserved: true,
        discountAmount: discountAmount || 0,
        appliedPromotions: appliedPromotions || []
      });

      await newlyCreatedOrder.save();

      // 2. Chuyển đổi cartItems thành định dạng line_items của Stripe
      const line_items = cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
          },
          unit_amount: Math.round(Number(item.price || 0) * 100),
        },
        quantity: item.quantity,
      }));

      // Nếu có giảm giá từ Voucher, tạo một coupon dùng 1 lần trên Stripe
      const sessionConfig = {
        payment_method_types: ["card"],
        line_items: line_items,
        mode: "payment",
        success_url: `${process.env.CLIENT_URL}/shop/stripe-return?orderId=${newlyCreatedOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/shop/stripe-cancel`,
      };

      if (discountAmount > 0) {
        const stripeCoupon = await stripe.coupons.create({
          amount_off: Math.round(discountAmount * 100),
          currency: "usd",
          duration: "once",
          name: "Voucher / Khuyến mãi",
        });
        sessionConfig.discounts = [{ coupon: stripeCoupon.id }];
      }

      // 3. Tạo Stripe Checkout Session
      stripeSession = await stripe.checkout.sessions.create(sessionConfig);
    } catch (processingError) {
      if (reservedItems.length > 0) {
        await releaseReservedStock(reservedItems);
      }
      if (newlyCreatedOrder?._id) {
        await Order.findByIdAndDelete(newlyCreatedOrder._id);
      }
      throw processingError;
    }

    // 4. Trả URL về cho Frontend
    res.status(201).json({
      success: true,
      approvalURL: stripeSession.url,
      orderId: newlyCreatedOrder._id,
    });

  } catch (e) {
    console.log(e);
    const knownStockError =
      typeof e?.message === "string" &&
      (e.message.includes("Insufficient stock") ||
        e.message.includes("Please select size and color") ||
        e.message.includes("Invalid cart item data") ||
        e.message.includes("Product not found"));

    res.status(knownStockError ? 400 : 500).json({
      success: false,
      message: knownStockError
        ? e.message
        : "Lỗi tạo đơn hàng Stripe!",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    // Lấy orderId và sessionId từ frontend gửi lên
    const { orderId, sessionId } = req.body;

    let order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // (Tùy chọn) Bạn có thể dùng sessionId để gọi API Stripe xác minh lại trạng thái thanh toán một lần nữa cho chắc chắn
    // const session = await stripe.checkout.sessions.retrieve(sessionId);
    // if (session.payment_status !== 'paid') return res.status(400).json({...})

    order.paymentStatus = "paid";
    order.orderStatus = "inProcess";
    order.paymentId = sessionId; // Lưu sessionId của Stripe thay cho paymentId của PayPal

    if (!order.stockReserved) {
      await reserveStockForItems(order.cartItems);
      order.stockReserved = true;
    }

    // Update totalSold for each product
    for (const item of order.cartItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { totalSold: item.quantity },
      });
    }

    // Update Voucher/Promotion usages
    if (order.appliedPromotions && order.appliedPromotions.length > 0) {
      for (const promo of order.appliedPromotions) {
        if (promo.promotionId) {
          await Promotion.findByIdAndUpdate(promo.promotionId, { $inc: { usedCount: 1 } });
        }
        if (promo.voucherCode) {
          await Voucher.findOneAndUpdate(
            { code: promo.voucherCode },
            { $inc: { usedCount: 1 } }
          );
        }
      }
    }

    const cart = await Cart.findById(order.cartId);
    if (cart) {
      order.cartItems.forEach((orderedItem) => {
        cart.items = cart.items.filter(
          (cartItem) =>
            !(cartItem.productId.toString() === orderedItem.productId.toString() &&
              (cartItem.size || '') === (orderedItem.size || '') &&
              (cartItem.color || '') === (orderedItem.color || ''))
        );
      });
      if (cart.items.length === 0) {
        await Cart.findByIdAndDelete(order.cartId);
      } else {
        await cart.save();
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    console.log(e);
    const knownStockError =
      typeof e?.message === "string" &&
      (e.message.includes("Insufficient stock") ||
        e.message.includes("Please select size and color") ||
        e.message.includes("Invalid cart item data") ||
        e.message.includes("Product not found"));

    res.status(knownStockError ? 400 : 500).json({
      success: false,
      message: knownStockError ? e.message : "Lỗi xác nhận thanh toán!",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId }).sort({ orderDate: -1 });

    for (const order of orders) {
      if (!order.orderCode) {
        await ensureOrderCode(order);
      }
    }

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    await ensureOrderCode(order);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const checkProductPurchase = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const order = await Order.findOne({
      userId,
      "cartItems.productId": productId,
      orderStatus: { $in: ["inProcess", "confirmed", "delivered"] },
    });

    res.status(200).json({
      success: true,
      hasPurchased: !!order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
  checkProductPurchase,
};
