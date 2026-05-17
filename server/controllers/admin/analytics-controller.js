const Order = require("../../models/Order");
const User = require("../../models/User");

const getRevenueAnalytics = async (req, res) => {
  try {
    const { filter = "day" } = req.query;

    // Revenue rules by payment method:
    // - COD: only count when delivered (payment collected on delivery)
    // - QR / Stripe: count from inShipping onward (payment already received)
    const codOrders = await Order.find({
      paymentMethod: "cod",
      $or: [{ orderStatus: "delivered" }, { paymentStatus: "paid" }],
    });

    const prepaidOrders = await Order.find({
      paymentMethod: { $in: ["qr_code", "stripe"] },
      orderStatus: { $in: ["inShipping", "delivered"] },
    });

    const revenueOrders = [...codOrders, ...prepaidOrders];

    // 2. Count unique customers from revenue-qualifying orders
    const purchasingCustomerIds = new Set(revenueOrders.map(order => order.userId));
    const totalUsers = purchasingCustomerIds.size;

    // 3. Get total number of orders (exclude cancelled)
    const totalOrdersCount = await Order.countDocuments({
      orderStatus: { $ne: "cancelled" },
    });

    let aggregatedData = {};
    let totalRevenue = 0;

    revenueOrders.forEach((order) => {
      const date = new Date(order.orderDate);
      let key;

      if (filter === "day") {
        key = date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else if (filter === "month") {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`; // YYYY-MM
      } else if (filter === "year") {
        key = `${date.getFullYear()}`; // YYYY
      }

      if (!aggregatedData[key]) {
        aggregatedData[key] = {
          revenue: 0,
          orders: 0
        };
      }

      aggregatedData[key].revenue += order.totalAmount;
      aggregatedData[key].orders += 1;
      totalRevenue += order.totalAmount;
    });

    // Convert aggregatedData to an array format suitable for Recharts
    const chartData = Object.keys(aggregatedData)
      .sort()
      .map((key) => ({
        label: key,
        revenue: aggregatedData[key].revenue,
        orders: aggregatedData[key].orders,
      }));

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalUsers,
        totalOrdersCount,
        chartData,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getComparisonAnalytics = async (req, res) => {
  try {
    const { period1, period2, type = "day" } = req.query;

    if (!period1 || !period2) {
      return res.status(400).json({
        success: false,
        message: "Both period1 and period2 are required!",
      });
    }

    const fetchPeriodData = async (period) => {
      let start, end;
      if (type === "day") {
        start = new Date(`${period}T00:00:00Z`);
        end = new Date(`${period}T23:59:59Z`);
      } else if (type === "month") {
        const [year, month] = period.split("-");
        start = new Date(Date.UTC(year, parseInt(month) - 1, 1));
        end = new Date(Date.UTC(year, parseInt(month), 0, 23, 59, 59));
      } else if (type === "year") {
        start = new Date(Date.UTC(period, 0, 1));
        end = new Date(Date.UTC(period, 11, 31, 23, 59, 59));
      }

      // COD: only delivered | QR/Stripe: inShipping + delivered
      const codOrders = await Order.find({
        orderDate: { $gte: start, $lte: end },
        paymentMethod: "cod",
        $or: [{ orderStatus: "delivered" }, { paymentStatus: "paid" }],
      });

      const prepaidOrders = await Order.find({
        orderDate: { $gte: start, $lte: end },
        paymentMethod: { $in: ["qr_code", "stripe"] },
        orderStatus: { $in: ["inShipping", "delivered"] },
      });

      const orders = [...codOrders, ...prepaidOrders];

      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalOrders = orders.length;
      const uniqueUsers = new Set(orders.map((o) => o.userId)).size;

      return { totalRevenue, totalOrders, uniqueUsers, label: period };
    };

    const data1 = await fetchPeriodData(period1);
    const data2 = await fetchPeriodData(period2);

    res.status(200).json({
      success: true,
      data: {
        period1: data1,
        period2: data2,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = { getRevenueAnalytics, getComparisonAnalytics };
