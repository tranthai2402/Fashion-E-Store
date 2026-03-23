const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?\d{9,15}$/;

//register
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;
  const identifier = email || userName;

  try {
    if (!identifier) {
      return res.json({
        success: false,
        message: "Please provide a user name or email to register",
      });
    }

    const checkUser = await User.findOne({ 
      $or: [
        { email: identifier },
        { userName: identifier }
      ]
    });
    if (checkUser)
      return res.json({
        success: false,
        message: "User Already exists with the same email or user name! Please try again",
      });

    const hashPassword = await bcrypt.hash(password, 12);
    const userPayload = { password: hashPassword };
    
    if (identifier.includes('@')) {
      userPayload.email = identifier;
    } else {
      userPayload.userName = identifier;
    }

    const newUser = new User(userPayload);

    await newUser.save();
    res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { email, password } = req.body; // 'email' field in req.body might hold either email or userName

  try {
    const checkUser = await User.findOne({
      $or: [{ email: email }, { userName: email }],
    });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exist! Please register first",
      });

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
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
      message: "Logged in successfully",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
        phone: checkUser.phone,
        avatar: checkUser.avatar,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
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
    const { userName, email, phone } = req.body;
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

    if (Object.prototype.hasOwnProperty.call(req.body, "userName")) {
      const nextUserNameValue = String(userName || "").trim();
      if (nextUserNameValue) {
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
            message: "Invalid email format",
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
            message: "Invalid phone number format",
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

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  updateUserProfile,
  changeUserPassword,
};
