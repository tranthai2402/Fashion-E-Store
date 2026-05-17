const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendNewsletterVoucher = async (email, voucherCode) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Chào mừng! Nhận mã giảm giá độc quyền của bạn",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #000;">Chào bạn!</h2>
        <p>Cảm ơn bạn đã đăng ký nhận bản tin của chúng tôi. Đây là mã giảm giá đặc biệt dành riêng cho bạn:</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="margin: 0; letter-spacing: 2px;">${voucherCode}</h1>
        </div>
        <p>Mã này có hiệu lực cho 1 lần sử dụng và hết hạn trong vòng 7 ngày kể từ hôm nay.</p>
        <p>Hãy nhanh tay quay lại website để mua sắm ngay nhé!</p>
        <a href="${process.env.CLIENT_URL}" style="display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">Quay lại mua hàng</a>
        <br/><br/>
        <p>Thân mến,<br/>Đội ngũ Saint Laurent</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/verify-link?token=${token}&email=${email}`;

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Xác thực tài khoản của bạn - Saint Laurent",
    html: `
      <div style="font-family: 'Playfair Display', serif; line-height: 1.6; color: #000; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 40px; text-align: center;">
        <h1 style="text-transform: uppercase; letter-spacing: 5px; font-weight: 300; margin-bottom: 30px;">Saint Laurent</h1>
        <p style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #666; margin-bottom: 20px;">Xác thực tài khoản</p>
        <p style="font-size: 16px; margin-bottom: 30px;">Cảm ơn bạn đã tham gia cộng đồng của chúng tôi. Vui lòng nhấn vào nút bên dưới để kích hoạt tài khoản của bạn:</p>
        <div style="margin: 30px 0;">
          <a href="${verificationLink}" style="background: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">
            Xác thực tài khoản
          </a>
        </div>
        <p style="font-size: 12px; color: #999; margin-top: 30px;">Nút này sẽ hết hạn trong vòng 24 giờ.</p>
        <p style="font-size: 12px; color: #999;">Nếu bạn không yêu cầu xác thực này, vui lòng bỏ qua email này.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;" />
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #ccc;">© 2026 Saint Laurent. All rights reserved.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendNewsletterVoucher, sendVerificationEmail };
