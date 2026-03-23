const Lookbook = require("../../models/Lookbook");

const activeProductMatch = {
  $or: [{ isActive: true }, { isActive: { $exists: false } }],
};

const getLookbookList = async (_req, res) => {
  try {
    const data = await Lookbook.find({})
      .select("_id imageUrl createdAt")
      .sort({ createdAt: -1 });

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

const getLookbookDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const lookbook = await Lookbook.findById(id).populate({
      path: "products",
      match: activeProductMatch,
      select: "_id title image salePrice price isActive",
    });

    if (!lookbook) {
      return res.status(404).json({
        success: false,
        message: "Lookbook not found",
      });
    }

    const filteredProducts = (lookbook.products || []).filter(Boolean);

    return res.status(200).json({
      success: true,
      data: {
        _id: lookbook._id,
        imageUrl: lookbook.imageUrl,
        products: filteredProducts,
      },
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
  getLookbookList,
  getLookbookDetails,
};
