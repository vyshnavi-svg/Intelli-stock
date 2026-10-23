const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  updateOrderStatus,
  getAllOrders,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Customer routes
router.post('/', protect, authorize('customer'), createOrder);
router.get('/my-orders', protect, authorize('customer'), getMyOrders);

// Vendor routes
router.get('/vendor/me', protect, authorize('vendor'), getVendorOrders);

// Admin routes
router.get('/', protect, authorize('admin'), getAllOrders);

// Common protected route for single order details
router.get('/:id', protect, getOrderById);

// Update status (Vendor or Admin)
router.put('/:id/status', protect, authorize('vendor', 'admin'), updateOrderStatus);

module.exports = router;
