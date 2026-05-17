const Address = require("../../models/Address");

const PHONE_REGEX = /^0\d{9}$/;

const addAddress = async (req, res) => {
  try {
    const {
      userId, fullName, phone,
      province, provinceCode,
      district, districtCode,
      ward, wardCode,
      addressDetail, addressType, notes,
    } = req.body;

    if (!userId || !fullName || !phone || !province || !district || !ward || !addressDetail) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin địa chỉ!",
      });
    }

    if (!PHONE_REGEX.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Số điện thoại phải bắt đầu bằng số 0 và gồm 10 số!",
      });
    }

    const newlyCreatedAddress = new Address({
      userId,
      fullName,
      phone,
      province,
      provinceCode,
      district,
      districtCode,
      ward,
      wardCode,
      addressDetail,
      addressType: addressType || "home",
      notes: notes || "",
      // Also populate legacy fields for backward compat
      address: addressDetail,
      city: province,
    });

    await newlyCreatedAddress.save();

    res.status(201).json({
      success: true,
      data: newlyCreatedAddress,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Error" });
  }
};

const fetchAllAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User id is required!" });
    }

    const addressList = await Address.find({ userId });

    res.status(200).json({ success: true, data: addressList });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Error" });
  }
};

const editAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const formData = req.body;

    if (!userId || !addressId) {
      return res.status(400).json({ success: false, message: "User and address id is required!" });
    }

    if (formData.phone && !PHONE_REGEX.test(formData.phone)) {
      return res.status(400).json({
        success: false,
        message: "Số điện thoại phải bắt đầu bằng số 0 và gồm 10 số!",
      });
    }

    // Sync legacy fields
    if (formData.addressDetail) formData.address = formData.addressDetail;
    if (formData.province) formData.city = formData.province;

    const address = await Address.findOneAndUpdate(
      { _id: addressId, userId },
      formData,
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    res.status(200).json({ success: true, data: address });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Error" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    if (!userId || !addressId) {
      return res.status(400).json({ success: false, message: "User and address id is required!" });
    }

    const address = await Address.findOneAndDelete({ _id: addressId, userId });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Error" });
  }
};

module.exports = { addAddress, editAddress, fetchAllAddress, deleteAddress };
