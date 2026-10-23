const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to calculate totals
const formatCartResponse = (cart) => {
  let subtotal = 0;
  const items = cart.items
    .filter((item) => item.product !== null)
    .map((item) => {
      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;
      return {
        _id: item._id,
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        itemSubtotal,
      };
    });

  return {
    _id: cart._id,
    customerId: cart.customerId,
    items,
    itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number((subtotal * 0.08).toFixed(2)), // 8% standard tax
    shipping: subtotal > 100 || subtotal === 0 ? 0 : 9.99, // Free shipping over $100
    total: Number((subtotal + (subtotal * 0.08) + (subtotal > 100 || subtotal === 0 ? 0 : 9.99)).toFixed(2)),
  };
};

// @desc    Get customer cart
// @route   GET /api/cart
// @access  Private (Customer)
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ customerId: req.user._id }).populate({
      path: 'items.product',
      select: 'name price image quantity inventoryStatus minimumStock maximumStock status',
    });

    if (!cart) {
      cart = await Cart.create({ customerId: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      cart: formatCartResponse(cart),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private (Customer)
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const requestedQty = Number(quantity);

    if (requestedQty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Product not found or inactive' });
    }

    if (product.quantity === 0) {
      return res.status(400).json({
        success: false,
        message: `"${product.name}" is currently Out of Stock`,
      });
    }

    let cart = await Cart.findOne({ customerId: req.user._id });
    if (!cart) {
      cart = new Cart({ customerId: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newQty = cart.items[existingItemIndex].quantity + requestedQty;
      if (newQty > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Only ${product.quantity} units available.`,
        });
      }
      cart.items[existingItemIndex].quantity = newQty;
      cart.items[existingItemIndex].price = product.price;
    } else {
      if (requestedQty > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Only ${product.quantity} units available.`,
        });
      }
      cart.items.push({
        product: product._id,
        quantity: requestedQty,
        price: product.price,
      });
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price image quantity inventoryStatus minimumStock maximumStock status',
    });

    res.status(200).json({
      success: true,
      message: `Added ${product.name} to cart`,
      cart: formatCartResponse(cart),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private (Customer)
const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const requestedQty = Number(quantity);

    let cart = await Cart.findOne({ customerId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    if (requestedQty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      if (requestedQty > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Only ${product.quantity} units available.`,
        });
      }

      cart.items[itemIndex].quantity = requestedQty;
      cart.items[itemIndex].price = product.price;
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price image quantity inventoryStatus minimumStock maximumStock status',
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: formatCartResponse(cart),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private (Customer)
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ customerId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price image quantity inventoryStatus minimumStock maximumStock status',
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: formatCartResponse(cart),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private (Customer)
const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ customerId: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: { items: [], itemCount: 0, subtotal: 0, tax: 0, shipping: 0, total: 0 },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
