const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please provide product ID'],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide customer ID'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comment'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting multiple reviews for the same product
reviewSchema.index({ productId: 1, customerId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
