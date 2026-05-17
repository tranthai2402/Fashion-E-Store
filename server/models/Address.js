const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    userId: String,
    fullName: String,       // Họ tên người nhận
    phone: String,          // Số điện thoại người nhận
    province: String,       // Tỉnh/Thành phố (tên)
    provinceCode: String,   // Mã tỉnh/thành phố
    district: String,       // Huyện/Quận (tên)
    districtCode: String,   // Mã huyện/quận
    ward: String,           // Phường/Xã (tên)
    wardCode: String,       // Mã phường/xã
    addressDetail: String,  // Địa chỉ cụ thể (số nhà, tên đường)
    addressType: { type: String, enum: ["home", "office"], default: "home" },
    notes: String,

    // Backward compatibility fields (kept so old data still works)
    address: String,
    city: String,
    pincode: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", AddressSchema);
