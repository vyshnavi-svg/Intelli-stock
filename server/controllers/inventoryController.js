const Product = require('../models/Product');
const Order = require('../models/Order');
const InventoryAlert = require('../models/InventoryAlert');

// @desc    Get vendor inventory dashboard KPI metrics and chart datasets
// @route   GET /api/inventory/dashboard
// @access  Private (Vendor, Admin)
const getInventoryDashboard = async (req, res, next) => {
  try {
    const vendorFilter = req.user.role === 'admin' ? {} : { vendorId: req.user._id };

    // Fetch vendor products
    const products = await Product.find(vendorFilter).populate('category', 'name');

    const totalProducts = products.length;
    let totalStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let overstockCount = 0;
    let healthyCount = 0;
    let totalInventoryValue = 0;

    const stockComparisonData = [];

    products.forEach((p) => {
      totalStock += p.quantity;
      totalInventoryValue += p.quantity * p.price;

      if (p.quantity === 0) {
        outOfStockCount++;
      } else if (p.quantity <= p.minimumStock) {
        lowStockCount++;
      } else if (p.quantity > p.maximumStock) {
        overstockCount++;
      } else {
        healthyCount++;
      }

      stockComparisonData.push({
        name: p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name,
        currentStock: p.quantity,
        minimumStock: p.minimumStock,
        maximumStock: p.maximumStock,
        price: p.price,
        status: p.inventoryStatus,
      });
    });

    // Orders and sales metrics for this vendor
    const orderQuery =
      req.user.role === 'admin'
        ? { orderStatus: { $ne: 'Cancelled' } }
        : { 'items.vendorId': req.user._id, orderStatus: { $ne: 'Cancelled' } };

    const orders = await Order.find(orderQuery);

    let totalOrders = orders.length;
    let totalRevenue = 0;
    let totalItemsSold = 0;

    const statusCounts = {
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
    };

    orders.forEach((ord) => {
      if (statusCounts[ord.orderStatus] !== undefined) {
        statusCounts[ord.orderStatus]++;
      }
      if (req.user.role === 'admin') {
        totalRevenue += ord.totalAmount;
        ord.items.forEach((i) => (totalItemsSold += i.quantity));
      } else {
        const myItems = ord.items.filter((i) => i.vendorId.toString() === req.user._id.toString());
        myItems.forEach((i) => {
          totalRevenue += i.price * i.quantity;
          totalItemsSold += i.quantity;
        });
      }
    });

    // Recent alerts
    const alertFilter = req.user.role === 'admin' ? {} : { vendorId: req.user._id };
    const recentAlerts = await InventoryAlert.find(alertFilter)
      .populate('productId', 'name image price quantity')
      .sort({ createdAt: -1 })
      .limit(6);

    const unreadAlertsCount = await InventoryAlert.countDocuments({
      ...alertFilter,
      isRead: false,
    });

    // Stock distribution dataset for PieChart
    const stockDistribution = [
      { name: 'Healthy', value: healthyCount, color: '#10B981' },
      { name: 'Low Stock', value: lowStockCount, color: '#F59E0B' },
      { name: 'Out of Stock', value: outOfStockCount, color: '#EF4444' },
      { name: 'Overstock', value: overstockCount, color: '#6366F1' },
    ];

    // Order status dataset
    const orderStatusDistribution = Object.keys(statusCounts).map((key) => ({
      name: key,
      count: statusCounts[key],
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalStock,
        totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
        lowStockCount,
        outOfStockCount,
        overstockCount,
        healthyCount,
        totalOrders,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalItemsSold,
        unreadAlertsCount,
      },
      charts: {
        stockDistribution,
        stockComparison: stockComparisonData.slice(0, 8),
        orderStatusDistribution,
      },
      recentAlerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all inventory alerts for vendor
// @route   GET /api/inventory/alerts
// @access  Private (Vendor, Admin)
const getInventoryAlerts = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { vendorId: req.user._id };
    const { isRead, severity } = req.query;

    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }
    if (severity) {
      filter.severity = severity.toUpperCase();
    }

    const alerts = await InventoryAlert.find(filter)
      .populate('productId', 'name price quantity minimumStock maximumStock image inventoryStatus')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single alert as read
// @route   PUT /api/inventory/alerts/:id/read
// @access  Private (Vendor, Admin)
const markAlertAsRead = async (req, res, next) => {
  try {
    const alert = await InventoryAlert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    if (req.user.role === 'vendor' && alert.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    alert.isRead = true;
    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Alert marked as read',
      alert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all alerts as read
// @route   PUT /api/inventory/alerts/read-all
// @access  Private (Vendor, Admin)
const markAllAlertsAsRead = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { vendorId: req.user._id };
    await InventoryAlert.updateMany(filter, { isRead: true });

    res.status(200).json({
      success: true,
      message: 'All inventory alerts marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock products
// @route   GET /api/inventory/low-stock
// @access  Private (Vendor, Admin)
const getLowStockProducts = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { vendorId: req.user._id };

    const products = await Product.find({
      ...filter,
      $expr: {
        $and: [
          { $gt: ['$quantity', 0] },
          { $lte: ['$quantity', '$minimumStock'] },
        ],
      },
    }).populate('category', 'name');

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get out of stock products
// @route   GET /api/inventory/out-of-stock
// @access  Private (Vendor, Admin)
const getOutOfStockProducts = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { vendorId: req.user._id };

    const products = await Product.find({
      ...filter,
      quantity: 0,
    }).populate('category', 'name');

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overstocked products
// @route   GET /api/inventory/overstock
// @access  Private (Vendor, Admin)
const getOverstockProducts = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { vendorId: req.user._id };

    const products = await Product.find({
      ...filter,
      $expr: {
        $gt: ['$quantity', '$maximumStock'],
      },
    }).populate('category', 'name');

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get intelligent reorder suggestions with exact calculations
// @route   GET /api/inventory/reorder-suggestions
// @access  Private (Vendor, Admin)
const getReorderSuggestions = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { vendorId: req.user._id };

    // Products where stock is at or below minimum threshold
    const products = await Product.find({
      ...filter,
      $expr: {
        $lte: ['$quantity', '$minimumStock'],
      },
    }).populate('category', 'name');

    const suggestions = products.map((p) => {
      const suggestedReorder = Math.max(0, p.maximumStock - p.quantity);
      const estimatedCost = Number((suggestedReorder * p.price).toFixed(2));
      const urgency = p.quantity === 0 ? 'CRITICAL' : 'HIGH';

      return {
        _id: p._id,
        name: p.name,
        category: p.category?.name || 'Uncategorized',
        currentStock: p.quantity,
        minimumStock: p.minimumStock,
        maximumStock: p.maximumStock,
        suggestedReorder,
        unitPrice: p.price,
        estimatedCost,
        urgency,
        inventoryStatus: p.inventoryStatus,
        image: p.image,
      };
    });

    res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventoryDashboard,
  getInventoryAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  getLowStockProducts,
  getOutOfStockProducts,
  getOverstockProducts,
  getReorderSuggestions,
};
