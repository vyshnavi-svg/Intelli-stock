const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price must be positive'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify category'],
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Product must belong to a vendor'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify stock quantity'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    minimumStock: {
      type: Number,
      required: [true, 'Please specify minimum stock threshold'],
      min: [0, 'Minimum stock cannot be negative'],
      default: 5,
    },
    maximumStock: {
      type: Number,
      required: [true, 'Please specify maximum stock threshold'],
      min: [1, 'Maximum stock must be at least 1'],
      default: 50,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active',
    },
    inventoryStatus: {
      type: String,
      enum: ['Healthy', 'Low Stock', 'Out of Stock', 'Overstock'],
      default: 'Healthy',
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for suggested reorder quantity: maximumStock - quantity (or 0 if overstock/healthy)
productSchema.virtual('suggestedReorder').get(function () {
  return Math.max(0, this.maximumStock - this.quantity);
});

module.exports = mongoose.model('Product', productSchema);
