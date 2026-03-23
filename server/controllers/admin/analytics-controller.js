const Order = require("../../models/Order");
const User = require("../../models/User");

const getRevenueAnalytics = async (req, res) => {
  try {
    const { filter = "day" } = req.query;

    // 1. Get confirmed/paid orders for revenue and order count aggregation
    const orders = await Order.find({
      orderStatus: "confirmed",
      paymentStatus: "paid",
    });

    // 2. Count unique customers who have actually purchased (paid)
    // We use a Set to get unique userIds from the paid orders
    const purchasingCustomerIds = new Set(orders.map(order => order.userId));
    const totalUsers = purchasingCustomerIds.size;

    // 3. Get total number of orders (all orders)
    const totalOrdersCount = await Order.countDocuments({});

    let aggregatedData = {};
    let totalRevenue = 0;

    orders.forEach((order) => {
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

      const orders = await Order.find({
        orderDate: { $gte: start, $lte: end },
        orderStatus: "confirmed",
        paymentStatus: "paid",
      });

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
