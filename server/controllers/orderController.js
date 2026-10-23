const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');
const { evaluateAndAlertProduct } = require('../utils/inventoryLogic');

// @desc    Create new order from cart or direct items
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod = 'Cash on Delivery' } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items specified' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full shipping address details (street, city, state, postalCode, country)',
      });
    }

    // Step 1: Validate stock for all items BEFORE committing changes
    const validatedItems = [];
    const productsToUpdate = [];

    for (const item of items) {
      const productId = item.product?._id || item.product || item.productId;
      const product = await Product.findById(productId);

      if (!product || product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name || productId}" is not available`,
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${item.quantity}`,
        });
      }

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
        vendorId: product.vendorId,
      });

      productsToUpdate.push({ product, orderQty: item.quantity });
    }

    // Step 2: Deduct stock, recalculate inventory status, and trigger intelligent alerts
    const alertsTriggered = [];
    for (const { product, orderQty } of productsToUpdate) {
      product.quantity -= orderQty;
      await product.save();

      // Intelligent inventory engine runs here!
      const evalResult = await evaluateAndAlertProduct(product);
      if (evalResult && evalResult.alertType) {
        alertsTriggered.push({
          productName: product.name,
          status: evalResult.status,
          alertType: evalResult.alertType,
          remainingStock: product.quantity,
          suggestedReorder: evalResult.suggestedReorder,
        });
      }
    }

    // Step 3: Calculate total amount
    const subtotal = validatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 100 ? 0 : 9.99;
    const totalAmount = Number((subtotal + tax + shipping).toFixed(2));

    // Step 4: Create Order record
    const order = await Order.create({
      customerId: req.user._id,
      items: validatedItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Completed',
      orderStatus: 'Confirmed',
    });

    // Step 5: Clear customer's cart
    await Cart.findOneAndUpdate({ customerId: req.user._id }, { items: [] });

    // Step 6: Create notifications for customer and vendors
    await Notification.create({
      userId: req.user._id,
      title: 'Order Placed Successfully',
      message: `Your order #${order._id.toString().slice(-6)} for $${order.totalAmount} has been confirmed.`,
      type: 'ORDER_PLACED',
      isRead: false,
    });

    // Notify each unique vendor in order
    const uniqueVendorIds = [...new Set(validatedItems.map((item) => item.vendorId.toString()))];
    for (const vendorId of uniqueVendorIds) {
      const vendorItems = validatedItems.filter((i) => i.vendorId.toString() === vendorId);
      await Notification.create({
        userId: vendorId,
        title: 'New Customer Order Received',
        message: `Order #${order._id.toString().slice(-6)} includes ${vendorItems.length} of your product(s).`,
        type: 'ORDER_PLACED',
        isRead: false,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
      inventoryUpdates: alertsTriggered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's orders
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private (Customer, Vendor, Admin)
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('items.product', 'name image price')
      .populate('items.vendorId', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Role check: customer must own it, vendor must have item in it, or admin
    if (req.user.role === 'customer' && order.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    if (req.user.role === 'vendor') {
      const hasVendorItem = order.items.some(
        (item) => item.vendorId && item.vendorId._id.toString() === req.user._id.toString()
      );
      if (!hasVendorItem) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
      }
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders for vendor's products
// @route   GET /api/orders/vendor/me
// @access  Private (Vendor)
const getVendorOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      'items.vendorId': req.user._id,
    })
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    // Filter order items so vendor only sees their own items or order totals
    const vendorOrders = orders.map((order) => {
      const myItems = order.items.filter(
        (i) => i.vendorId.toString() === req.user._id.toString()
      );
      const myTotal = myItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

      return {
        _id: order._id,
        customerId: order.customerId,
        items: myItems,
        vendorSubtotal: Number(myTotal.toFixed(2)),
        totalOrderAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: vendorOrders.length,
      orders: vendorOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Vendor, Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (orderStatus && !validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Choose from: ${validStatuses.join(', ')}`,
      });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    // Notify customer about order status change
    await Notification.create({
      userId: order.customerId,
      title: `Order Status Updated: ${order.orderStatus}`,
      message: `Your order #${order._id.toString().slice(-6)} is now ${order.orderStatus}.`,
      type: 'ORDER_STATUS',
      isRead: false,
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to ${order.orderStatus}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all orders
// @route   GET /api/orders
// @access  Private (Admin)
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  updateOrderStatus,
  getAllOrders,
};
