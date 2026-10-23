const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/product/:productId', getProductReviews);
router.post('/', protect, authorize('customer'), createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
