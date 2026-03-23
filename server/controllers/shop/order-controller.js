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

const createOrder = async (req, res) => {
  try {
    const {
      userId, cartItems, addressInfo, orderStatus, totalAmount,
      orderDate, orderUpdateDate, cartId,
    } = req.body;

    const orderCode = await createUniqueOrderCode(orderDate);

    // 1. Lưu đơn hàng vào DB với trạng thái pending
    const newlyCreatedOrder = new Order({
      userId,
      orderCode,
      cartId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod: "stripe", // Đổi thành stripe
      paymentStatus: "pending", totalAmount, orderDate, orderUpdateDate,
    });

    await newlyCreatedOrder.save();

    // 2. Chuyển đổi cartItems thành định dạng line_items của Stripe
    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
        },
        unit_amount: Math.round(item.price * 100), // Stripe tính bằng cent (1 USD = 100 cents)
      },
      quantity: item.quantity,
    }));

    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe secret key is not configured on server",
      });
    }

    // 3. Tạo Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      // Truyền orderId vào URL để lúc Return về Frontend có thể lấy được
      success_url: `http://localhost:5173/shop/stripe-return?orderId=${newlyCreatedOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "http://localhost:5173/shop/stripe-cancel",
    });

    // 4. Trả URL về cho Frontend
    res.status(201).json({
      success: true,
      approvalURL: session.url, // Đưa URL của Stripe vào biến approvalURL
      orderId: newlyCreatedOrder._id,
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Lỗi tạo đơn hàng Stripe!" });
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
    order.orderStatus = "confirmed";
    order.paymentId = sessionId; // Lưu sessionId của Stripe thay cho paymentId của PayPal

    // Trừ stock và xóa giỏ hàng
    for (let item of order.cartItems) {
      if (item.size && item.color) {
        // Trừ kho variant
        const product = await Product.findById(item.productId);
        if (product && product.variants) {
          const variant = product.variants.find(v => v.size === item.size && v.color === item.color);
          if (variant && variant.stock >= item.quantity) {
            variant.stock -= item.quantity;
            product.totalStock = Math.max(0, product.totalStock - item.quantity);
            await product.save();
          } else {
            console.log(`Warning: Insufficient stock for variant ${item.size} ${item.color} of ${item.title}`);
          }
        }
      } else {
        // Trừ kho bình thường (không có variant)
        let product = await Product.findById(item.productId);
        if (product) {
          product.totalStock = Math.max(0, product.totalStock - item.quantity);
          await product.save();
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
    res.status(500).json({ success: false, message: "Lỗi xác nhận thanh toán!" });
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
      orderStatus: "confirmed",
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
