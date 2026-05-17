const Voucher = require("../../models/Voucher");
const Order = require("../../models/Order");

const getPublicVouchers = async (req, res) => {
  try {
    const { userId } = req.query;

    const vouchers = await Voucher.find({ isPublic: true, status: "active" })
      .populate({
        path: "promotionId",
        match: {
          status: "active",
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        }
      });

    // 1. Lọc bỏ các mã không hợp lệ (không kèm promotion active)
    let validVouchers = vouchers.filter(v => v.promotionId !== null);

    // 2. Nếu có userId, lọc bỏ những mã đã dùng hết lượt cho phép
    if (userId && validVouchers.length > 0) {
      const filtered = [];
      for (const v of validVouchers) {
        const promo = v.promotionId;
        if (promo.usagePerUser > 0) {
          const userUsageCount = await Order.countDocuments({
            userId,
            "appliedPromotions.promotionId": promo._id,
            paymentStatus: "paid"
          });
          if (userUsageCount < promo.usagePerUser) filtered.push(v);
        } else {
          filtered.push(v);
        }
      }
      validVouchers = filtered;
    }

    res.status(200).json({
      success: true,
      data: validVouchers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

module.exports = { getPublicVouchers };
