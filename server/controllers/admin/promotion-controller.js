const Promotion = require("../../models/Promotion");
const Voucher = require("../../models/Voucher");

// =======================
// PROMOTION CONTROLLERS
// =======================

const createPromotion = async (req, res) => {
  try {
    const { action } = req.body;
    if (action && action.discountType === "percentage" && action.discountValue >= 100) {
      return res.status(400).json({
        success: false,
        message: "Mức giảm phần trăm phải nhỏ hơn 100%",
      });
    }
    const newPromotion = new Promotion(req.body);
    await newPromotion.save();
    return res.status(201).json({
      success: true,
      message: "Tạo promotion thành công!",
      data: newPromotion,
    });
  } catch (error) {
    console.log("Error creating promotion", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (action && action.discountType === "percentage" && action.discountValue >= 100) {
      return res.status(400).json({
        success: false,
        message: "Mức giảm phần trăm phải nhỏ hơn 100%",
      });
    }

    const updatedPromo = await Promotion.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedPromo) {
      return res.status(404).json({ success: false, message: "Không tìm thấy promotion!" });
    }

    // Đồng bộ thuộc tính sang các Voucher liên quan (nếu có)
    const updateVoucherData = { 
      isPublic: updatedPromo.isPublic,
      usagePerUser: updatedPromo.usagePerUser,
      usageLimit: updatedPromo.usageLimit
    };

    // If code is provided, update the voucher code as well
    if (req.body.code) {
      updateVoucherData.code = req.body.code.toUpperCase();
    }

    await Voucher.updateMany(
      { promotionId: id },
      { $set: updateVoucherData }
    );

    return res.status(200).json({
      success: true,
      message: "Cập nhật promotion thành công!",
      data: updatedPromo,
    });
  } catch (error) {
    console.log("Error updating promotion", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPromo = await Promotion.findByIdAndDelete(id);

    if (!deletedPromo) {
      return res.status(404).json({ success: false, message: "Không tìm thấy promotion!" });
    }

    // Optional: Delete associated vouchers
    await Voucher.deleteMany({ promotionId: id });

    return res.status(200).json({
      success: true,
      message: "Đã xóa promotion",
    });
  } catch (error) {
    console.log("Error deleting promotion", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find({}).sort({ createdAt: -1 }).lean();
    
    // Fetch all vouchers and attach them to promotions
    const allVouchers = await Voucher.find({}).lean();
    
    const enrichedPromotions = promotions.map(promo => {
      const voucher = allVouchers.find(v => v.promotionId.toString() === promo._id.toString());
      return {
        ...promo,
        code: voucher ? voucher.code : ""
      };
    });

    return res.status(200).json({
      success: true,
      data: enrichedPromotions,
    });
  } catch (error) {
    console.log("Error fetching promotions", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

const getPromotionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findById(id);
    
    if (!promotion) {
      return res.status(404).json({ success: false, message: "Không tìm thấy promotion!" });
    }

    // Include associated vouchers
    const vouchers = await Voucher.find({ promotionId: id });

    return res.status(200).json({
      success: true,
      data: {
        promotion,
        vouchers
      },
    });
  } catch (error) {
    console.log("Error fetching promotion details", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

// =======================
// VOUCHER CONTROLLERS
// =======================

const createVoucher = async (req, res) => {
  try {
    const { code, promotionId, usageLimit, usagePerUser, isPublic } = req.body;

    const existingVoucher = await Voucher.findOne({ code });
    if (existingVoucher) {
      return res.status(400).json({ success: false, message: "Mã giảm giá đã tồn tại!" });
    }

    const newVoucher = new Voucher({
      code,
      promotionId,
      usageLimit,
      usagePerUser,
      isPublic
    });

    await newVoucher.save();

    return res.status(201).json({
      success: true,
      message: "Tạo voucher thành công!",
      data: newVoucher,
    });
  } catch (error) {
    console.log("Error creating voucher", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVoucher = await Voucher.findByIdAndDelete(id);

    if (!deletedVoucher) {
      return res.status(404).json({ success: false, message: "Không tìm thấy voucher!" });
    }

    return res.status(200).json({
      success: true,
      message: "Đã xóa voucher",
    });
  } catch (error) {
    console.log("Error deleting voucher", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

module.exports = {
  createPromotion,
  updatePromotion,
  deletePromotion,
  getAllPromotions,
  getPromotionDetails,
  createVoucher,
  deleteVoucher
};
