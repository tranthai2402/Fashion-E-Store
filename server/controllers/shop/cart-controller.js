const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const User = require("../../models/User");
const { calculateCartDiscounts } = require("../../helpers/promotionCalculator");


const normalizeValue = (value) => String(value || "").trim().toLowerCase();

const resolveAvailableStock = (product, { variantId, size, color }) => {
  if (!product) {
    return { ok: false, message: "Product not found", stock: 0, variant: null };
  }

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  if (!hasVariants) {
    return {
      ok: true,
      stock: Number(product.totalStock) || 0,
      variant: null,
    };
  }

  let targetVariant = null;

  if (variantId) {
    targetVariant = product.variants.id(variantId);
  } else {
    const normalizedSize = normalizeValue(size);
    const normalizedColor = normalizeValue(color);

    if (!normalizedSize || !normalizedColor) {
      return {
        ok: false,
        message: "Please select both size and color",
        stock: 0,
        variant: null,
      };
    }

    targetVariant = product.variants.find(
      (variant) =>
        normalizeValue(variant.size) === normalizedSize &&
        normalizeValue(variant.color) === normalizedColor
    );
  }

  if (!targetVariant) {
    return {
      ok: false,
      message: "Selected variant is unavailable",
      stock: 0,
      variant: null,
    };
  }

  return {
    ok: true,
    stock: Number(targetVariant.stock) || 0,
    variant: targetVariant,
  };
};

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, size, color } = req.body;

    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const stockResult = resolveAvailableStock(product, { size, color });
    if (!stockResult.ok) {
      return res.status(400).json({
        success: false,
        message: stockResult.message,
      });
    }

    const selectedSize = stockResult?.variant?.size || size;
    const selectedColor = stockResult?.variant?.color || color;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        normalizeValue(item.size) === normalizeValue(selectedSize) &&
        normalizeValue(item.color) === normalizeValue(selectedColor)
    );

    let currentCartQuantity = 0;
    if (findCurrentProductIndex !== -1) {
      currentCartQuantity = cart.items[findCurrentProductIndex].quantity;
    }

    const checkStock = stockResult.stock;

    if (currentCartQuantity + quantity > checkStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${checkStock} items left in stock`,
      });
    }

    if (findCurrentProductIndex === -1) {
      cart.items.push({
        productId,
        quantity,
        size: selectedSize,
        color: selectedColor,
      });
    } else {
      cart.items[findCurrentProductIndex].quantity += quantity;
    }

    await cart.save();
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.log("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error occurred while adding to cart",
    });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;
    const { voucherCode } = req.query; // Capture optional voucherCode

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is manadatory!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice category",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const validItems = cart.items.filter(
      (productItem) => productItem.productId
    );

    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const populateCartItems = validItems.map((item) => {
      const product = item.productId;
      let variant = null;
      if (item.variantId && product.variants) {
        variant = product.variants.id(item.variantId);
      }

      return {
        productId: product._id,
        variantId: item.variantId,
        image: product.image,
        title: product.title,
        price: variant ? variant.price : product.price,
        salePrice: variant ? variant.salePrice : product.salePrice,
        quantity: item.quantity,
        size: variant ? variant.size : item.size,
        color: variant ? variant.color : item.color,
        category: product.category,
      };
    });

    // Tính toán khuyến mãi và giảm giá
    const user = await User.findById(userId); // Fetch user context
    let calculations = { subtotal: 0, discountTotal: 0, grandTotal: 0, appliedPromotions: [] };
    let voucherError = null;

    // Lọc danh sách sản phẩm dựa trên selectedItems nếu được cung cấp (dùng cho trang Checkout)
    let itemsToCalculate = populateCartItems;
    if (req.query.selectedItems) {
      const selectedKeys = Array.isArray(req.query.selectedItems) 
        ? req.query.selectedItems 
        : [req.query.selectedItems];
        
      itemsToCalculate = populateCartItems.filter(item => {
        const itemKey = `${item.productId}-${item.size || ''}-${item.color || ''}`;
        return selectedKeys.includes(itemKey);
      });
    }

    try {
      if (itemsToCalculate.length > 0) {
        calculations = await calculateCartDiscounts(itemsToCalculate, user, voucherCode);
      }
    } catch (calcError) {
      console.error("Promotion calculation error:", calcError);
      voucherError = calcError.message;
      // Vẫn tiếp tục tính toán nhưng bỏ qua voucher nếu lỗi voucher
      try {
         calculations = await calculateCartDiscounts(itemsToCalculate, user, null);
      } catch(e) {}
    }

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
        calculations,
        voucherError
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, variantId, quantity, size, color } = req.body;

    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        (variantId
          ? item.variantId?.toString() === variantId
          : normalizeValue(item.size) === normalizeValue(size) &&
            normalizeValue(item.color) === normalizeValue(color))
    );

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present !",
      });
    }

    const currentCartItem = cart.items[findCurrentProductIndex];
    const stockResult = resolveAvailableStock(product, {
      variantId: variantId || currentCartItem?.variantId,
      size: size || currentCartItem?.size,
      color: color || currentCartItem?.color,
    });

    if (!stockResult.ok) {
      return res.status(400).json({
        success: false,
        message: stockResult.message,
      });
    }

    const checkStock = stockResult.stock;

    if (quantity > checkStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${checkStock} items left in stock`,
      });
    }

    cart.items[findCurrentProductIndex].quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice variants",
    });

    const populateCartItems = cart.items.map((item) => {
      const prod = item.productId;
      let variant = null;
      if (item.variantId && prod && prod.variants) {
        variant = prod.variants.id(item.variantId);
      }

      return {
        productId: prod ? prod._id : null,
        variantId: item.variantId,
        image: prod ? prod.image : null,
        title: prod ? prod.title : "Product not found",
        price: variant ? variant.price : (prod ? prod.price : null),
        salePrice: variant ? variant.salePrice : (prod ? prod.salePrice : null),
        quantity: item.quantity,
        size: variant ? variant.size : item.size,
        color: variant ? variant.color : item.color,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { size, color } = req.query; // Get size and color from query

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    cart.items = cart.items.filter((item) => {
      const isProductIdMatch = item.productId._id.toString() === productId;

      // Handle cases where size/color might be undefined, null, or the string "undefined"
      const normalizedQuerySize =
        size === "undefined" || size === "null" || !size ? "" : size;
      const normalizedQueryColor =
        color === "undefined" || color === "null" || !color ? "" : color;

      const normalizedItemSize = item.size || "";
      const normalizedItemColor = item.color || "";

      const isSizeMatch = normalizedItemSize === normalizedQuerySize;
      const isColorMatch = normalizedItemColor === normalizedQueryColor;

      return !(isProductIdMatch && isSizeMatch && isColorMatch);
    });

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = {
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  fetchCartItems,
};
