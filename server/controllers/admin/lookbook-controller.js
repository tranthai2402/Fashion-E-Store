const mongoose = require("mongoose");
const Lookbook = require("../../models/Lookbook");

const addLookbook = async (req, res) => {
  try {
    const { imageUrl, products = [] } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "imageUrl is required",
      });
    }

    const normalizedProducts = Array.isArray(products)
      ? products
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
          .map((id) => new mongoose.Types.ObjectId(id))
      : [];

    const lookbook = new Lookbook({
      imageUrl,
      products: normalizedProducts,
    });

    await lookbook.save();

    return res.status(201).json({
      success: true,
      data: lookbook,
      message: "Lookbook created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const getAllLookbooksForAdmin = async (_req, res) => {
  try {
    const data = await Lookbook.find({})
      .populate("products", "title image isActive")
      .sort({ order: 1 });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const deleteLookbook = async (req, res) => {
  try {
    const { id } = req.params;

    await Lookbook.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Lookbook deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const reorderLookbooks = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }

    if (Array.isArray(items)) {
      await Promise.all(
        items.map((item) =>
          Lookbook.findByIdAndUpdate(item.id, { order: item.order })
        )
      );
    }

    const data = await Lookbook.find({})
      .populate("products", "title image isActive")
      .sort({ order: 1 });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

module.exports = {
  addLookbook,
  getAllLookbooksForAdmin,
  deleteLookbook,
  reorderLookbooks,
};
