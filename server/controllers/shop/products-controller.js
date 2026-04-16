const Product = require("../../models/Product");
const { enrichProductsWithAutomaticPromotions } = require("../../helpers/promotionCalculator");

const getFilteredProducts = async (req, res) => {
  try {
    const { category = [], brand = [], keyword = "", sortBy = "price-lowtohigh" } = req.query;

    let filters = {};

    if (keyword) {
      filters.title = new RegExp(keyword, "i");
    }

    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

    if (brand.length) {
      filters.brand = { $in: brand.split(",") };
    }

    let sort = {};

    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      default:
        sort.price = 1;
        break;
    }
    
    const products = await Product.find(filters).sort(sort);
    
    // Enrich with active automatic promotions
    const enrichedProducts = await enrichProductsWithAutomaticPromotions(products);

    res.status(200).json({
      success: true,
      data: enrichedProducts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    const enrichedProduct = await enrichProductsWithAutomaticPromotions([product]);

    res.status(200).json({
      success: true,
      data: enrichedProduct[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const getBestSellingProducts = async (req, res) => {
  try {
    const { category = "" } = req.query;

    let filters = { isActive: true };
    if (category) {
      filters.category = category;
    }

    // 1. Get manually selected bestsellers first (prioritize these)
    let manualBestsellers = await Product.find({ ...filters, isBestSeller: true })
      .sort({ totalSold: -1 })
      .limit(4);

    let finalProducts = [...manualBestsellers];

    // 2. If fewer than 4 manual bestsellers, fill remaining slots with top-selling products by totalSold
    if (finalProducts.length < 4) {
      const remainingCount = 4 - finalProducts.length;
      const manualIds = manualBestsellers.map(p => p._id);

      const topSellers = await Product.find({
        ...filters,
        isBestSeller: { $ne: true }, // Don't pick products already marked as bestsellers
        _id: { $nin: manualIds }      // Safety check to avoid any duplicates
      })
      .sort({ totalSold: -1 })
      .limit(remainingCount);

      finalProducts = [...finalProducts, ...topSellers];
    }
    
    // Enrich with active automatic promotions
    const enrichedProducts = await enrichProductsWithAutomaticPromotions(finalProducts);

    res.status(200).json({
      success: true,
      data: enrichedProducts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails, getBestSellingProducts };
