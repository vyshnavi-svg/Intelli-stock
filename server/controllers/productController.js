const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const { evaluateStock, evaluateAndAlertProduct } = require('../utils/inventoryLogic');

// @desc    Get all products with filtering, search, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      sort,
      vendorId,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { status: 'active' };

    // Search by product name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by Category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by Vendor
    if (vendorId) {
      query.vendorId = vendorId;
    }

    // Filter by Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
    }

    // Filter by in-stock
    if (inStock === 'true') {
      query.quantity = { $gt: 0 };
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { averageRating: -1 };
    else if (sort === 'newest') sortOptions = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('vendorId', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name description')
      .populate('vendorId', 'name email phone');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviews = await Review.find({ productId: product._id })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      product,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Vendor, Admin)
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      category,
      quantity = 0,
      minimumStock = 5,
      maximumStock = 50,
      image,
      status = 'active',
    } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, price, category',
      });
    }

    // Initial evaluation
    const evaluation = evaluateStock(quantity, minimumStock, maximumStock, name);

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      vendorId: req.user._id,
      quantity: Number(quantity),
      minimumStock: Number(minimumStock),
      maximumStock: Number(maximumStock),
      image: image || undefined,
      status,
      inventoryStatus: evaluation.status,
    });

    // Generate alert if product is created in low stock or out of stock state
    await evaluateAndAlertProduct(product);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Vendor, Admin)
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check ownership if vendor
    if (req.user.role === 'vendor' && product.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this product',
      });
    }

    const {
      name,
      description,
      price,
      category,
      quantity,
      minimumStock,
      maximumStock,
      image,
      status,
    } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category) product.category = category;
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (minimumStock !== undefined) product.minimumStock = Number(minimumStock);
    if (maximumStock !== undefined) product.maximumStock = Number(maximumStock);
    if (image) product.image = image;
    if (status) product.status = status;

    await product.save();

    // Re-evaluate intelligent inventory state
    await evaluateAndAlertProduct(product);

    const updatedProduct = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('vendorId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Vendor, Admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.user.role === 'vendor' && product.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this product',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products for logged-in vendor
// @route   GET /api/products/vendor/me
// @access  Private (Vendor)
const getVendorProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ vendorId: req.user._id })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick stock update / restock
// @route   PUT /api/products/:id/stock
// @access  Private (Vendor, Admin)
const updateProductStock = async (req, res, next) => {
  try {
    const { quantity, restockAmount } = req.body;
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.user.role === 'vendor' && product.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (quantity !== undefined) {
      product.quantity = Math.max(0, Number(quantity));
    } else if (restockAmount !== undefined) {
      product.quantity = Math.max(0, product.quantity + Number(restockAmount));
    }

    await product.save();
    const evaluation = await evaluateAndAlertProduct(product);

    res.status(200).json({
      success: true,
      message: `Stock updated for ${product.name}. Current stock: ${product.quantity}`,
      product,
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts,
  updateProductStock,
};
