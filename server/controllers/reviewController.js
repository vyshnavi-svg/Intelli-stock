const Review = require('../models/Review');
const Product = require('../models/Product');

// Helper to recalculate and update product rating
const updateProductRatingStats = async (productId) => {
  const reviews = await Review.find({ productId });
  const numReviews = reviews.length;
  const averageRating =
    numReviews > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / numReviews).toFixed(1))
      : 0;

  await Product.findByIdAndUpdate(productId, {
    numReviews,
    averageRating,
  });
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product review
// @route   POST /api/reviews
// @access  Private (Customer)
const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide productId, rating (1-5), and review comment',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if customer already submitted review
    const alreadyReviewed = await Review.findOne({
      productId,
      customerId: req.user._id,
    });

    if (alreadyReviewed) {
      // Update existing review
      alreadyReviewed.rating = Number(rating);
      alreadyReviewed.comment = comment;
      await alreadyReviewed.save();

      await updateProductRatingStats(productId);

      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        review: alreadyReviewed,
      });
    }

    const review = await Review.create({
      productId,
      customerId: req.user._id,
      rating: Number(rating),
      comment,
    });

    await updateProductRatingStats(productId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Customer, Admin)
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (req.user.role !== 'admin' && review.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(req.params.id);
    await updateProductRatingStats(productId);

    res.status(200).json({
      success: true,
      message: 'Review deleted',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createReview,
  deleteReview,
};
