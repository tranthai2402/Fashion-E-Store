const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    sparse: true,
  },
  fullName: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  phone: {
    type: String,
  },
  avatar: {
    type: String,
  },
  password: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    default: "user",
  },
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
module.exports = User;
