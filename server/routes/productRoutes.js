const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts,
  updateProductStock,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getProducts);

// Specific vendor route (must be before /:id)
router.get('/vendor/me', protect, authorize('vendor'), getVendorProducts);

router.get('/:id', getProductById);

// Protected routes (Vendor or Admin)
router.post('/', protect, authorize('vendor', 'admin'), createProduct);
router.put('/:id', protect, authorize('vendor', 'admin'), updateProduct);
router.put('/:id/stock', protect, authorize('vendor', 'admin'), updateProductStock);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);

module.exports = router;
