const Promotion = require("../models/Promotion");
const Voucher = require("../models/Voucher");
const Order = require("../models/Order");

/**
 * Áp dụng điều kiện và tính toán giảm giá cho giỏ hàng
 * @param {Array} cartItems - Danh sách sản phẩm trong giỏ (cần populates productId)
 * @param {Object} user - User object (chứa role, lịch sử mua hàng để check new_user/vip nếu cần)
 * @param {String} voucherCode - (Optional) Mã ứng dụng riêng
 */
const calculateCartDiscounts = async (cartItems, user, voucherCode = null) => {
  let subtotal = 0;
  
  // Tính tổng tiền gốc
  cartItems.forEach((item) => {
    // Nếu sản phẩm có giá sale (salePrice cũ), ta sử dụng salePrice hoặc price gốc tùy logic.
    // Thường promotion sẽ áp dụng trên tổng tạm tính (giá gốc hoặc giá sale mặc định).
    const priceToUse = item.salePrice > 0 ? item.salePrice : item.price;
    subtotal += priceToUse * item.quantity;
  });

  let discountTotal = 0;
  let appliedPromotions = [];
  let freeShipping = false;

  const now = new Date();

  // 1. Lấy khách các Automatic Promotions đang active
  // Chỉ áp dụng những mã có điều kiện giá trị đơn hàng hoặc số lượng (vì những mã không điều kiện đã được tính vào salePrice rồi)
  const activePromotions = await Promotion.find({
    status: "active",
    type: { $in: ["automatic", "flash_sale", "seasonal"] },
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { "conditions.minOrderValue": { $gt: 0 } },
      { "conditions.minQuantity": { $gt: 0 } },
    ]
  }).sort({ priority: -1 }); // Ưu tiên cao xuống thấp

  // 2. Nếu có voucher, kiểm tra và lấy thêm Promotion của voucher đó
  let voucherPromo = null;
  let appliedVoucher = null;
  if (voucherCode) {
    const voucher = await Voucher.findOne({ code: voucherCode, status: "active" }).populate("promotionId");
    if (voucher) {
      // Kiểm tra giới hạn lượt dùng tổng quát
      if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
        throw new Error("Mã giảm giá đã hết lượt sử dụng");
      }
      
      // KIỂM TRA RÀNG BUỘC EMAIL (Tối ưu hóa bảo mật mã cá nhân)
      if (voucher.restrictedToEmail && user && user.email) {
        if (voucher.restrictedToEmail.toLowerCase() !== user.email.toLowerCase()) {
          throw new Error("Mã giảm giá này chỉ dành riêng cho chủ sở hữu email đã đăng ký");
        }
      } else if (voucher.restrictedToEmail && !user) {
        throw new Error("Vui lòng đăng nhập bằng email đã nhận mã để sử dụng voucher này");
      }
      
      const promo = voucher.promotionId;
      if (promo && promo.status === "active" && promo.startDate <= now && promo.endDate >= now) {
        voucherPromo = promo;
        appliedVoucher = voucher;
      } else {
        throw new Error("Chương trình của mã giảm giá này đã hết hạn hoặc không hoạt động");
      }
    } else {
      throw new Error("Mã giảm giá không hợp lệ");
    }
  }

  // Kết hợp danh sách (ưa tiên voucher > auto promo)
  const allPromos = voucherPromo ? [voucherPromo, ...activePromotions] : activePromotions;

  // 3. Quét từng Promotion để áp dụng
  for (const promo of allPromos) {
    // --- EVALUATE CONDITIONS ---
    if (promo.conditions) {
      const { minOrderValue, minQuantity, applicableProducts, applicableCategories, targetAudience } = promo.conditions;

      if (minOrderValue > 0 && subtotal < minOrderValue) {
        if (voucherPromo && promo._id.equals(voucherPromo._id)) {
          throw new Error(`Mã giảm giá yêu cầu đơn hàng tối thiểu $${minOrderValue}`);
        }
        continue;
      }
      
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      if (minQuantity > 0 && totalItems < minQuantity) {
        if (voucherPromo && promo._id.equals(voucherPromo._id)) {
          throw new Error(`Mã giảm giá yêu cầu tối thiểu ${minQuantity} sản phẩm`);
        }
        continue;
      }

      // Xử lý Target Audience (All, VIP, New_User) -> Logic kiểm tra custom tùy định nghĩa User
      if (targetAudience === "new_user" || targetAudience === "vip") {
        // Cần logic so sánh với field "role" hoặc "order_count" của User
        // Tạm thời nếu user ko thỏa, skip.
      }

      // 3.1 Check usagePerUser
      if (promo.usagePerUser > 0 && user && user._id) {
        const userUsageCount = await Order.countDocuments({
          userId: user._id,
          "appliedPromotions.promotionId": promo._id,
          paymentStatus: "paid" // Chỉ tính những đơn đã thanh toán thành công
        });

        if (userUsageCount >= promo.usagePerUser) {
          if (voucherPromo && promo._id.equals(voucherPromo._id)) {
            throw new Error(`Bạn đã hết lượt sử dụng mã giảm giá này (Tối đa ${promo.usagePerUser} lần)`);
          }
          continue;
        }
      }
    }

    // --- EVALUATE ACTIONS ---
    // Kiểm tra tính hợp lệ trên danh sách sản phẩm cụ thể
    const { action } = promo;
    let applicableAmount = subtotal;

    // Nếu khuyến mãi chỉ áp dụng cho một số sản phẩm / danh mục
    let hasApplicableItems = true;
    const productCond = promo.conditions?.applicableProducts || [];
    const categoryCond = promo.conditions?.applicableCategories || [];
    const isRestricted = productCond.length > 0 || categoryCond.length > 0;

    const getEligibleItems = (items) => {
      if (!isRestricted) return items;
      return items.filter(item => {
        const itemProdId = item.productId._id?.toString() || item.productId.toString();
        const isProductMatch = productCond.some(pId => pId.toString() === itemProdId);
        const isCategoryMatch = categoryCond.some(cat => cat && item.category && cat.toLowerCase() === item.category.toLowerCase());
        return isProductMatch || isCategoryMatch;
      });
    };

    const eligibleItems = getEligibleItems(cartItems);

    if (isRestricted && eligibleItems.length === 0) {
      hasApplicableItems = false;
    } else {
      applicableAmount = eligibleItems.reduce((acc, item) => {
        const p = item.salePrice > 0 ? item.salePrice : item.price;
        return acc + (p * item.quantity);
      }, 0);
    }

    if (!hasApplicableItems) {
      if (voucherPromo && promo._id.equals(voucherPromo._id)) {
        throw new Error("Mã giảm giá không áp dụng cho các sản phẩm trong giỏ");
      }
      continue;
    }

    // Tính mức giảm và breakdown cho từng sản phẩm
    let discountAmountThisPromo = 0;
    let productBreakdown = [];

    if (action.discountType === "percentage") {
      const discountPercentage = action.discountValue / 100;
      let totalDiscountBeforeCap = 0;
      
      eligibleItems.forEach(item => {
        const price = item.salePrice > 0 ? item.salePrice : item.price;
        const itemTotal = price * item.quantity;
        let itemDiscount = itemTotal * discountPercentage;
        productBreakdown.push({
          productId: item.productId._id?.toString() || item.productId.toString(),
          size: item.size,
          color: item.color,
          discountAmount: itemDiscount
        });
        totalDiscountBeforeCap += itemDiscount;
      });

      discountAmountThisPromo = totalDiscountBeforeCap;
      if (action.maxDiscountAmount > 0 && discountAmountThisPromo > action.maxDiscountAmount) {
        // Nếu vượt quá maxDiscountAmount, tỉ lệ lại breakdown
        const ratio = action.maxDiscountAmount / discountAmountThisPromo;
        productBreakdown = productBreakdown.map(b => ({
          ...b,
          discountAmount: b.discountAmount * ratio
        }));
        discountAmountThisPromo = action.maxDiscountAmount;
      }
    } else if (action.discountType === "fixed_amount") {
      discountAmountThisPromo = action.discountValue;
      if (discountAmountThisPromo > applicableAmount) {
        discountAmountThisPromo = applicableAmount;
      }

      // Phân bổ chiết khấu cố định theo tỉ lệ giá trị sản phẩm
      eligibleItems.forEach(item => {
        const price = item.salePrice > 0 ? item.salePrice : item.price;
        const itemTotal = price * item.quantity;
        const itemRatio = itemTotal / applicableAmount;
        productBreakdown.push({
          productId: item.productId._id?.toString() || item.productId.toString(),
          size: item.size,
          color: item.color,
          discountAmount: discountAmountThisPromo * itemRatio
        });
      });
    } else if (action.discountType === "free_shipping") {
      freeShipping = true;
    }

    // Ghi nhận nếu có giảm
    if (discountAmountThisPromo > 0 || freeShipping) {
      discountTotal += discountAmountThisPromo;
      appliedPromotions.push({
        promotionId: promo._id,
        name: promo.name,
        discountAmount: discountAmountThisPromo,
        voucherCode: voucherPromo && promo._id.equals(voucherPromo._id) ? voucherCode : null,
        productBreakdown // Trả về breakdown để hiển thị ở frontend
      });

      // LUÔN LUÔN DỪNG LẠI sau khi áp dụng 1 ưu đãi (Chỉ được dùng 1 mã/1 ưu đãi một lần)
      break;
    }
  }

  // Đảm bảo giảm không quá subtotal
  if (discountTotal > subtotal) {
    discountTotal = subtotal;
  }

  const grandTotal = subtotal - discountTotal;

  return {
    subtotal,
    discountTotal,
    grandTotal,
    freeShipping,
    appliedPromotions,
    voucherDetails: appliedVoucher ? {
      code: appliedVoucher.code,
      id: appliedVoucher._id
    } : null
  };
};

const enrichProductsWithAutomaticPromotions = async (products) => {
  const now = new Date();
  
  // Lấy các khuyến mãi tự động đang active
  // CHỈ lấy các mã KHÔNG có điều kiện ràng buộc về tổng đơn (unconditional) để hiển thị giá sale trực tiếp
  const activePromos = await Promotion.find({
    status: "active",
    type: { $in: ["automatic", "flash_sale", "seasonal"] },
    startDate: { $lte: now },
    endDate: { $gte: now },
    $and: [
      {
        $or: [
          { "conditions.minOrderValue": { $lte: 0 } },
          { "conditions.minOrderValue": { $exists: false } },
          { "conditions.minOrderValue": null },
        ],
      },
      {
        $or: [
          { "conditions.minQuantity": { $lte: 0 } },
          { "conditions.minQuantity": { $exists: false } },
          { "conditions.minQuantity": null },
        ],
      },
    ],
  }).sort({ priority: -1 });

  if (!activePromos.length) return products;

  return products.map((product) => {
    const basePrice = product.price;
    let bestSalePrice =
      product.salePrice && product.salePrice > 0 ? product.salePrice : 0;

    for (const promo of activePromos) {
      // Check conditions
      const productCond = promo.conditions?.applicableProducts || [];
      const categoryCond = promo.conditions?.applicableCategories || [];
      const isRestricted = productCond.length > 0 || categoryCond.length > 0;

      let isMatch = true;
      if (isRestricted) {
        const prodId = product._id.toString();
        const category = product.category ? product.category.toLowerCase() : "";
        const isProductMatch = productCond.some(
          (pId) => pId.toString() === prodId
        );
        const isCategoryMatch = categoryCond.some(
          (cat) => cat && cat.toLowerCase() === category
        );
        isMatch = isProductMatch || isCategoryMatch;
      }

      if (isMatch) {
        const { action } = promo;
        let calculatedSalePrice = 0;

        if (action.discountType === "percentage") {
          calculatedSalePrice = basePrice * (1 - action.discountValue / 100);
        } else if (action.discountType === "fixed_amount") {
          calculatedSalePrice = Math.max(0, basePrice - action.discountValue);
        }

        // Chỉ áp dụng nếu giá sau giảm THỰC SỰ thấp hơn giá gốc và tốt hơn giá sale hiện tại
        if (calculatedSalePrice > 0 && calculatedSalePrice < basePrice) {
          if (bestSalePrice === 0 || calculatedSalePrice < bestSalePrice) {
            bestSalePrice = calculatedSalePrice;
          }
          // Tiếp tục kiểm tra các promo khác nếu muốn tìm giá thấp nhất tuyệt đối, 
          // nhưng do đã sort theo priority nên thường promo đầu tiên đã là promo quan trọng nhất.
          // Tuy nhiên ta sẽ bỏ break để đảm bảo tìm được giá THẤP NHẤT (Best Deal)
        }
      }
    }

    return {
      ...product.toObject ? product.toObject() : product,
      originalSalePrice: product.salePrice,
      salePrice: bestSalePrice > 0 ? Number(bestSalePrice.toFixed(2)) : projectSalePrice(product)
    };
  });
};

function projectSalePrice(product) {
  return product.salePrice || 0;
}

module.exports = {
  calculateCartDiscounts,
  enrichProductsWithAutomaticPromotions
};
