const Order = require("../../models/Order");
const User = require("../../models/User");

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

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({});

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    for (const order of orders) {
      if (!order.orderCode) {
        await ensureOrderCode(order);
      }
    }

    // Fetch user details for each order manually since userId is a string
    const userIds = [...new Set(orders.map((order) => order.userId))];
    const users = await User.find({ _id: { $in: userIds } }).select("userName email");

    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = { userName: user.userName, email: user.email };
      return acc;
    }, {});

    const ordersWithUserDetails = orders.map((order) => ({
      ...order._doc,
      userName: userMap[order.userId]?.userName || "Unknown User",
      email: userMap[order.userId]?.email || "N/A",
    }));

    res.status(200).json({
      success: true,
      data: ordersWithUserDetails,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
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

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    await Order.findByIdAndUpdate(id, { orderStatus });

    res.status(200).json({
      success: true,
      message: "Order status is updated successfully!",
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
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};
