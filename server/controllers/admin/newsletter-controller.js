const NewsletterSubscriber = require("../../models/NewsletterSubscriber");
const User = require("../../models/User");

const getAllEmails = async (req, res) => {
  try {
    // 1. Lấy toàn bộ người dùng đã đăng ký tài khoản
    const users = await User.find({}, "userName email role createdAt");
    
    // 2. Lấy toàn bộ người đăng ký bản tin
    const subscribers = await NewsletterSubscriber.find({});

    // 3. Hợp nhất dữ liệu dựa trên Email
    const emailMap = new Map();

    // Duyệt qua Users trước
    users.forEach(user => {
      // Bỏ qua nếu user không có email (security/log cleaning)
      if (!user.email) return;

      const normalizedEmail = user.email.toLowerCase();
      emailMap.set(normalizedEmail, {
        email: user.email,
        name: user.userName || "Unnamed User",
        isRegisteredUser: true,
        isNewsletterSubscribed: false,
        role: user.role,
        registeredAt: user.createdAt,
        voucherCode: null
      });
    });

    // Duyệt qua Subscribers để bổ sung/cập nhật thông tin
    subscribers.forEach(sub => {
      if (!sub.email) return;

      const normalizedEmail = sub.email.toLowerCase();
      if (emailMap.has(normalizedEmail)) {
        const existing = emailMap.get(normalizedEmail);
        existing.isNewsletterSubscribed = true;
        existing.voucherCode = sub.voucherCode;
      } else {
        emailMap.set(normalizedEmail, {
          email: sub.email,
          name: "Guest Subscriber",
          isRegisteredUser: false,
          isNewsletterSubscribed: true,
          role: null,
          registeredAt: sub.createdAt,
          voucherCode: sub.voucherCode
        });
      }
    });

    const combinedList = Array.from(emailMap.values());
    console.log(`Fetched ${combinedList.length} total combined email records.`);

    return res.status(200).json({
      success: true,
      data: combinedList,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách email:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

const deleteSubscriber = async (req, res) => {
  try {
    const { email } = req.params;
    await NewsletterSubscriber.findOneAndDelete({ email });
    return res.status(200).json({ success: true, message: "Đã xóa đăng ký bản tin" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

module.exports = { getAllEmails, deleteSubscriber };
