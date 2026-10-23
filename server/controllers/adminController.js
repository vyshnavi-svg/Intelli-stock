const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');

// @desc    Get Admin Dashboard system statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();

    // Inventory counts
    const lowStockCount = await Product.countDocuments({
      $expr: {
        $and: [{ $gt: ['$quantity', 0] }, { $lte: ['$quantity', '$minimumStock'] }],
      },
    });

    const outOfStockCount = await Product.countDocuments({ quantity: 0 });
    const overstockCount = await Product.countDocuments({
      $expr: { $gt: ['$quantity', '$maximumStock'] },
    });
    const healthyCount = await Product.countDocuments({
      $expr: {
        $and: [{ $gt: ['$quantity', '$minimumStock'] }, { $lte: ['$quantity', '$maximumStock'] }],
      },
    });

    // Orders & Revenue
    const orders = await Order.find({ orderStatus: { $ne: 'Cancelled' } });
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    const recentOrders = await Order.find()
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    // Distribution datasets for Recharts
    const userDistribution = [
      { name: 'Customers', value: totalCustomers, color: '#3B82F6' },
      { name: 'Vendors', value: totalVendors, color: '#8B5CF6' },
      { name: 'Admins', value: await User.countDocuments({ role: 'admin' }), color: '#EC4899' },
    ];

    const inventoryStatusDistribution = [
      { name: 'Healthy', value: healthyCount, color: '#10B981' },
      { name: 'Low Stock', value: lowStockCount, color: '#F59E0B' },
      { name: 'Out of Stock', value: outOfStockCount, color: '#EF4444' },
      { name: 'Overstock', value: overstockCount, color: '#6366F1' },
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalVendors,
        totalCustomers,
        totalProducts,
        totalCategories,
        totalOrders,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        lowStockCount,
        outOfStockCount,
        overstockCount,
        healthyCount,
      },
      charts: {
        userDistribution,
        inventoryStatusDistribution,
      },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with role filter
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/inactive status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deactivating self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own admin account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.name} is now ${user.isActive ? 'Active' : 'Inactive'}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories (Admin)
// @route   GET /api/admin/categories
// @access  Private (Admin) or Public via category route
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/admin/categories
// @access  Private (Admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide category name' });
    }

    const exists = await Category.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      image: image || undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Category created',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description;
    if (image) category.image = image;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if products exist in category
    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${productCount} products are linked to it.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getUsers,
  toggleUserStatus,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
