const NewsletterSubscriber = require("../../models/NewsletterSubscriber");
const Promotion = require("../../models/Promotion");
const Voucher = require("../../models/Voucher");
const { sendNewsletterVoucher } = require("../../helpers/emailService");
const crypto = require("crypto");

const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập email hợp lệ" });
    }

    console.log("Newsletter request received for email:", email);

    const existingSubscriber = await NewsletterSubscriber.findOne({ email });
    if (existingSubscriber) {
      console.log("Email already exists in subscriber list:", email);
      return res.status(400).json({ success: false, message: "Email này đã nhận mã trước đó" });
    }

    // 1. Tự động tìm hoặc tạo một Promotion
    let newsletterPromo = await Promotion.findOne({ name: "Newsletter Welcome" });
    if (!newsletterPromo) {
      console.log("Newsletter Welcome promotion not found. Creating a default one...");
      // ... (existing creation logic)
      newsletterPromo = new Promotion({
        name: "Newsletter Welcome",
        description: "Mã giảm giá cho khách hàng mới đăng ký bản tin",
        type: "code_based",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isPublic: false,
        status: "active",
        conditions: {
          minOrderValue: 0,
          minQuantity: 0,
          targetAudience: "new_user",
        },
        action: {
          discountType: "percentage",
          discountValue: 10,
        },
        usageLimit: null,
        usagePerUser: 1,
      });
      await newsletterPromo.save();
    }

    // 2. Sinh mã voucher unique
    const uniquePart = crypto.randomBytes(3).toString("hex").toUpperCase();
    const voucherCode = `WELCOME-${uniquePart}`;

    const newVoucher = new Voucher({
      code: voucherCode,
      promotionId: newsletterPromo._id,
      usageLimit: 1,
      usagePerUser: 1,
      isPublic: false,
      restrictedToEmail: email, // Ràng buộc voucher với email này
    });
    await newVoucher.save();
    console.log("Generated voucher code:", voucherCode);

    // 3. Gửi email TRƯỚC khi lưu subscriber để đảm bảo gửi thành công
    console.log("Attempting to send email via SMTP...");
    try {
      await sendNewsletterVoucher(email, voucherCode);
      console.log("Email sent successfully to:", email);
      
      // Chỉ lưu vào Database nếu gửi mail thành công
      const newSubscriber = new NewsletterSubscriber({
        email,
        voucherCode,
        promotionId: newsletterPromo._id,
        isSent: true,
      });
      await newSubscriber.save();

      return res.status(201).json({
        success: true,
        message: "Đã gửi mã giảm giá thành công về email của bạn",
        data: { voucherCode },
      });
    } catch (emailError) {
      console.error("CRITICAL EMAIL ERROR:", emailError.message);
      // Xóa voucher vừa tạo vì gửi mail thất bại để tránh rác
      await Voucher.findByIdAndDelete(newVoucher._id);
      
      return res.status(500).json({ 
        success: false, 
        message: "Lỗi cấu hình gửi mail trên server. Hãy kiểm tra lại mật khẩu ứng dụng Gmail!" 
      });
    }
  } catch (error) {
    console.error("Lỗi đăng ký bản tin:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

module.exports = { subscribeNewsletter };
