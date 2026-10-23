const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getUsers,
  toggleUserStatus,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public category read route for storefront dropdowns & categories
router.get('/categories/public', getCategories);

// All other admin routes require Admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
