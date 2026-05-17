const Product = require("../../models/Product");
const Promotion = require("../../models/Promotion");
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

const getSaleProducts = async (req, res) => {
  try {
    const { category = "" } = req.query;
    const now = new Date();

    // 1. Find all active and unconditional promotions (automatic, flash_sale, seasonal)
    const activePromos = await Promotion.find({
      status: "active",
      type: { $in: ["automatic", "flash_sale", "seasonal"] },
      startDate: { $lte: now },
      endDate: { $gte: now },
      $and: [
        {
          $or: [
            { "conditions.minOrderValue": { $lte: 0 } },
            { "conditions.minOrderValue": { $exists: false } },
            { "conditions.minOrderValue": null },
          ],
        },
        {
          $or: [
            { "conditions.minQuantity": { $lte: 0 } },
            { "conditions.minQuantity": { $exists: false } },
            { "conditions.minQuantity": null },
          ],
        },
      ],
    });

    // 2. Extract product IDs and categories from these promotions
    let promoProductIds = [];
    let promoCategories = [];

    activePromos.forEach((promo) => {
      if (promo.conditions?.applicableProducts?.length > 0) {
        promoProductIds = [
          ...promoProductIds,
          ...promo.conditions.applicableProducts.map((id) => id.toString()),
        ];
      }
      if (promo.conditions?.applicableCategories?.length > 0) {
        promoCategories = [
          ...promoCategories,
          ...promo.conditions.applicableCategories.map((cat) =>
            cat.toLowerCase()
          ),
        ];
      }
    });

    let filters = { isActive: true };
    if (category) {
      filters.category = category;
    }

    // 3. Get manually selected sale items (isSaleItem)
    let manualSaleItems = await Product.find({ ...filters, isSaleItem: true })
      .sort({ updatedAt: -1 })
      .limit(8);

    let finalProducts = [...manualSaleItems];

    // 4. Fill remaining slots with products that satisfy:
    //    a) Have a salePrice > 0 stored in DB
    //    b) OR are explicitly linked in an active promotion
    //    c) OR belong to a category linked in an active promotion
    if (finalProducts.length < 8) {
      const remainingCount = 8 - finalProducts.length;
      const manualIds = manualSaleItems.map(p => p._id);

      const dynamicSaleQuery = {
        ...filters,
        isSaleItem: { $ne: true },
        _id: { $nin: manualIds },
        $or: [
          { salePrice: { $gt: 0 } },
          { _id: { $in: promoProductIds } },
          { category: { $in: promoCategories } }
        ]
      };

      const computedSales = await Product.find(dynamicSaleQuery)
        .sort({ updatedAt: -1 })
        .limit(remainingCount);

      finalProducts = [...finalProducts, ...computedSales];
    }

    // Enrich with active automatic promotions (to calculate the actual display price)
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

module.exports = { getFilteredProducts, getProductDetails, getBestSellingProducts, getSaleProducts };
