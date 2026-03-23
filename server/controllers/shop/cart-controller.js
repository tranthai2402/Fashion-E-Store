const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

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

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size && item.color === color
    );

    let currentCartQuantity = 0;
    if (findCurrentProductIndex !== -1) {
      currentCartQuantity = cart.items[findCurrentProductIndex].quantity;
    }

    let checkStock = product.totalStock;
    if (size && color && product.variants && product.variants.length > 0) {
      const variant = product.variants.find(v => v.size === size && v.color === color);
      if (variant) checkStock = variant.stock;
    }

    if (currentCartQuantity + quantity > checkStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${checkStock} items left in stock`,
      });
    }

    if (findCurrentProductIndex === -1) {
      cart.items.push({ productId, quantity, size, color });
    } else {
      cart.items[findCurrentProductIndex].quantity += quantity;
    }

    await cart.save();
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is manadatory!",
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
        (variantId ? item.variantId?.toString() === variantId : (item.size === size && item.color === color))
    );

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present !",
      });
    }

    let checkStock = product.totalStock;
    if (variantId && product.variants && product.variants.length > 0) {
      const variant = product.variants.id(variantId);
      if (variant) checkStock = variant.stock;
    }

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
