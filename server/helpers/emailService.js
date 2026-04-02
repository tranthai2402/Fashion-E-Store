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

module.exports = { sendNewsletterVoucher };
