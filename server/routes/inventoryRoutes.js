const express = require('express');
const router = express.Router();
const {
  getInventoryDashboard,
  getInventoryAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  getLowStockProducts,
  getOutOfStockProducts,
  getOverstockProducts,
  getReorderSuggestions,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All inventory endpoints require Vendor or Admin authorization
router.use(protect, authorize('vendor', 'admin'));

router.get('/dashboard', getInventoryDashboard);
router.get('/alerts', getInventoryAlerts);
router.put('/alerts/read-all', markAllAlertsAsRead);
router.put('/alerts/:id/read', markAlertAsRead);
router.get('/low-stock', getLowStockProducts);
router.get('/out-of-stock', getOutOfStockProducts);
router.get('/overstock', getOverstockProducts);
router.get('/reorder-suggestions', getReorderSuggestions);

module.exports = router;
