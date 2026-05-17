const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../../models/User");
const { sendVerificationEmail } = require("../../helpers/emailService");
const { sendVerificationSMS } = require("../../helpers/smsService");

const EMAIL_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9.]*[a-zA-Z0-9])?@gmail\.com$/;
const PHONE_REGEX = /^0\d{9}$/;
// Username: chỉ cho phép chữ cái (có dấu tiếng Việt), dấu cách, gạch dưới. Không cho phép số và ký tự đặc biệt.
const USERNAME_REGEX = /^[a-zA-ZÀ-ỹ\s_]+$/;
// Password: tối thiểu 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const validateIdentifier = (identifier) => {
  const errors = [];
  const val = identifier.trim();

  if (val.includes('@')) {
    // Validate as email
    if (!EMAIL_REGEX.test(val)) {
      errors.push("Email phải là địa chỉ @gmail.com hợp lệ");
    }
  } else {
    // Validate as username
    if (!USERNAME_REGEX.test(val)) {
      errors.push("Tên người dùng chỉ được chứa chữ cái, không được có ký tự đặc biệt hoặc số");
    }
    if (val.length < 3) {
      errors.push("Tên người dùng phải có ít nhất 3 ký tự");
    }
    if (val.length > 30) {
      errors.push("Tên người dùng không được quá 30 ký tự");
    }
  }
  return errors;
};

const validatePassword = (password) => {
  const errors = [];
  if (!password || password.length < 8) {
    errors.push("Mật khẩu phải có ít nhất 8 ký tự");
  }
  if (password && !PASSWORD_REGEX.test(password)) {
    if (!/[a-z]/.test(password)) errors.push("Mật khẩu phải có ít nhất 1 chữ thường");
    if (!/[A-Z]/.test(password)) errors.push("Mật khẩu phải có ít nhất 1 chữ hoa");
    if (!/\d/.test(password)) errors.push("Mật khẩu phải có ít nhất 1 chữ số");
    if (!/[@$!%*?&]/.test(password)) errors.push("Mật khẩu phải có ít nhất 1 ký tự đặc biệt (@$!%*?&)");
  }
  return errors;
};

//register
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    if (!userName || !userName.trim()) {
      return res.json({
        success: false,
        message: "Vui lòng nhập tên người dùng",
      });
    }

    if (!email || !email.trim()) {
      return res.json({
        success: false,
        message: "Vui lòng nhập email đăng ký",
      });
    }

    // Validate userName
    const userNameErrors = validateIdentifier(userName.trim());
    if (userNameErrors.length > 0) {
      return res.json({
        success: false,
        message: "Lỗi tên người dùng: " + userNameErrors.join(". "),
      });
    }

    // Validate email
    const emailErrors = validateIdentifier(email.trim());
    if (emailErrors.length > 0) {
      return res.json({
        success: false,
        message: "Lỗi email: " + emailErrors.join(". "),
      });
    }

    // Validate password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.json({
        success: false,
        message: passwordErrors.join(". "),
      });
    }

    // Check if user already exists
    const checkUser = await User.findOne({
      $or: [
        { userName: userName.trim() },
        { email: email.trim() }
      ]
    });

    if (checkUser) {
      return res.json({
        success: false,
        message: "Tên người dùng hoặc email đã được sử dụng! Vui lòng thử lại",
      });
    }

    const hashPassword = await bcrypt.hash(password, 12);
    
    // Generate secure verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const newUser = new User({ 
      userName: userName.trim(),
      email: email.trim(),
      password: hashPassword,
      verificationToken,
      verificationTokenExpires,
      isVerified: false,
    });
    
    await newUser.save();

    // Send the verification link
    try {
      await sendVerificationEmail(email.trim(), verificationToken);
    } catch (sendError) {
      console.error("Error sending verification email:", sendError);
      // We still registered the user, but they might need to resend email
    }

    res.status(200).json({
      success: true,
      message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi trong quá trình đăng ký",
    });
  }
};

// Verify user via link
const verifyLink = async (req, res) => {
  const { token, email } = req.query;

  try {
    if (!token || !email) {
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/auth/login?error=invalid_verification`);
    }

    const user = await User.findOne({
      email: email.trim(),
      verificationToken: token.trim(),
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/auth/login?error=verification_expired`);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    const jwtToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        userName: user.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.cookie("token", jwtToken, { httpOnly: true, secure: false })
      .redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/shop/home`);
  } catch (e) {
    console.log(e);
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/auth/login?error=server_error`);
  }
};

// Verify user (fallback or alternative method)
const verifyUser = async (req, res) => {
  const { email, token } = req.body;

  try {
    if (!email || !token) {
      return res.json({
        success: false,
        message: "Thiếu thông tin xác thực",
      });
    }

    const user = await User.findOne({
      email: email.trim(),
      verificationToken: token.trim(),
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.json({
        success: false,
        message: "Liên kết xác thực không hợp lệ hoặc đã hết hạn",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    const jwtToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        userName: user.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.cookie("token", jwtToken, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Xác thực thành công",
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        userName: user.userName,
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống trong quá trình xác thực",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { email, password } = req.body; 

  try {
    if (!email || !email.trim()) {
      return res.json({
        success: false,
        message: "Vui lòng nhập email hoặc tên người dùng",
      });
    }

    if (!password) {
      return res.json({
        success: false,
        message: "Vui lòng nhập mật khẩu",
      });
    }

    const checkUser = await User.findOne({
      $or: [
        { email: email.trim() }, 
        { userName: email.trim() }
      ],
    });

    if (!checkUser)
      return res.json({
        success: false,
        message: "Tài khoản không tồn tại! Vui lòng đăng ký trước",
      });

    if (!checkUser.isVerified) {
      return res.json({
        success: false,
        message: "Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email.",
      });
    }

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Mật khẩu không đúng! Vui lòng thử lại",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Đăng nhập thành công",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
        avatar: checkUser.avatar,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi",
    });
  }
};

//logout

const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");

    // Fetch fresh user data from DB to ensure role is up to date
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found!",
      });
    }

    req.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      userName: user.userName,
      phone: user.phone,
      avatar: user.avatar,
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { fullName, userName, email, phone } = req.body;
    const userId = req.user?.id;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    const updateFields = {};
    const unsetFields = {};
    let finalUserName = currentUser.userName || "";
    let finalEmail = currentUser.email || "";

    // fullName ONLY accepts Vietnamese alphabets and spaces
    const FULLNAME_REGEX = /^[a-zA-ZÀ-ỹÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴáàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ\s]+$/;

    if (Object.prototype.hasOwnProperty.call(req.body, "fullName")) {
      const nextFullNameValue = String(fullName || "").trim();
      if (nextFullNameValue) {
        if (!FULLNAME_REGEX.test(nextFullNameValue)) {
          return res.status(400).json({
            success: false,
            message: "Họ tên chỉ được chứa chữ cái, không nhập số hoặc ký tự đặc biệt",
          });
        }
        updateFields.fullName = nextFullNameValue;
      } else {
        unsetFields.fullName = 1;
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "userName")) {
      const nextUserNameValue = String(userName || "").trim();
      if (nextUserNameValue) {
        if (!USERNAME_REGEX.test(nextUserNameValue)) {
          return res.status(400).json({
            success: false,
            message: "Username chỉ được chứa chữ cái (có dấu), khoảng trắng và gạch dưới",
          });
        }
        if (nextUserNameValue !== currentUser.userName) {
          const existingUserName = await User.findOne({
            userName: nextUserNameValue,
            _id: { $ne: currentUser._id },
          }).select("_id");

          if (existingUserName) {
            return res.status(400).json({
              success: false,
              message: "User name already in use",
            });
          }
        }
        updateFields.userName = nextUserNameValue;
        finalUserName = nextUserNameValue;
      } else {
        unsetFields.userName = 1;
        finalUserName = "";
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "email")) {
      const nextEmailValue = String(email || "").trim();
      if (nextEmailValue) {
        if (!EMAIL_REGEX.test(nextEmailValue)) {
          return res.status(400).json({
            success: false,
            message: "Email phải là địa chỉ @gmail.com hợp lệ",
          });
        }
        if (nextEmailValue !== currentUser.email) {
          const existingEmail = await User.findOne({
            email: nextEmailValue,
            _id: { $ne: currentUser._id },
          }).select("_id");

          if (existingEmail) {
            return res.status(400).json({
              success: false,
              message: "Email already in use",
            });
          }
        }
        updateFields.email = nextEmailValue;
        finalEmail = nextEmailValue;
      } else {
        unsetFields.email = 1;
        finalEmail = "";
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "phone")) {
      const nextPhoneRaw = String(phone || "").trim();
      const normalizedPhone = nextPhoneRaw.replace(/[\s-]/g, "");
      if (normalizedPhone) {
        if (!PHONE_REGEX.test(normalizedPhone)) {
          return res.status(400).json({
            success: false,
            message: "Số điện thoại không hợp lệ",
          });
        }
        updateFields.phone = normalizedPhone;
      } else {
        unsetFields.phone = 1;
      }
    }

    if (Object.keys(updateFields).length === 0 && Object.keys(unsetFields).length === 0) {
      return res.status(200).json({
        success: true,
        message: "No changes to update",
        user: {
          id: currentUser._id,
          role: currentUser.role,
          email: currentUser.email,
          userName: currentUser.userName,
          fullName: currentUser.fullName,
          phone: currentUser.phone,
          avatar: currentUser.avatar,
        },
      });
    }

    if (!String(finalUserName || "").trim() && !String(finalEmail || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "User name or email is required",
      });
    }

    const updateQuery = {};
    if (Object.keys(updateFields).length > 0) updateQuery.$set = updateFields;
    if (Object.keys(unsetFields).length > 0) updateQuery.$unset = unsetFields;

    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      updateQuery,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        role: updatedUser.role,
        email: updatedUser.email,
        userName: updatedUser.userName,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới là bắt buộc",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    // Nếu người dùng đã có mật khẩu (người dùng đăng ký thường hoặc đã set pass)
    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập mật khẩu hiện tại",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu hiện tại không đúng",
        });
      }

      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu mới phải khác mật khẩu hiện tại",
        });
      }
    }
    // Nếu người dùng chưa có mật khẩu (thường là đăng nhập qua Google lần đầu)
    // Cho phép thiết lập mật khẩu mà không cần mật khẩu hiện tại

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: user.password ? "Cập nhật mật khẩu thành công" : "Thiết lập mật khẩu thành công",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi cập nhật mật khẩu",
    });
  }
};

// Google OAuth callback handler
const googleAuthCallback = (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/auth/login?error=google_auth_failed`);
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        userName: user.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res
      .cookie("token", token, { httpOnly: true, secure: false })
      .redirect(`${process.env.CLIENT_URL}/shop/home`);
  } catch (error) {
    console.log(error);
    res.redirect(`${process.env.CLIENT_URL}/auth/login?error=server_error`);
  }
};

module.exports = {
  registerUser,
  verifyUser,
  verifyLink,
  loginUser,
  logoutUser,
  authMiddleware,
  updateUserProfile,
  changeUserPassword,
  googleAuthCallback,
};
