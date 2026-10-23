import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  AlertTriangle,
  Package,
} from 'lucide-react';
import API from '../services/api';
import Loader from '../components/Loader';
import { formatCurrency, getStatusBadgeClass, formatDate } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [cartError, setCartError] = useState('');

  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.product);
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (product.quantity === 0) return;
    setAdding(true);
    setCartError('');
    const res = await addToCart(product._id, quantity);
    setAdding(false);

    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } else {
      setCartError(res.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError('Please write your review comment');
      return;
    }

    try {
      setReviewLoading(true);
      setReviewError('');
      const res = await API.post('/reviews', {
        productId: product._id,
        rating,
        comment,
      });

      if (res.data.success) {
        setReviewSuccess(res.data.message);
        setComment('');
        fetchProduct(); // Refresh reviews and rating
        setTimeout(() => setReviewSuccess(''), 3000);
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading product information..." />;
  }

  if (!product) {
    return (
      <div className="app-container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.quantity === 0;
  const isLowStock = product.quantity > 0 && product.quantity <= product.minimumStock;

  return (
    <div className="main-content">
      <div className="app-container">
        {/* Breadcrumb */}
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link> /{' '}
          <Link to="/products" style={{ color: 'var(--text-muted)' }}>Marketplace</Link> /{' '}
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{product.name}</span>
        </div>

        {/* Product Showcase Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '40px',
            marginBottom: '50px',
          }}
        >
          {/* Product Image */}
          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: '100%',
                maxHeight: '440px',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          </div>

          {/* Product Information */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Vendor badge & Category */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {product.category?.name || 'General'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--secondary)' }}>
                <Store size={14} /> Sold by: <strong>{product.vendorId?.name || 'Vendor'}</strong>
              </div>
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.2, marginBottom: '12px' }}>
              {product.name}
            </h1>

            {/* Rating and Reviews Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    fill={star <= Math.round(product.averageRating || 5) ? '#f59e0b' : '#e2e8f0'}
                    color={star <= Math.round(product.averageRating || 5) ? '#f59e0b' : '#cbd5e1'}
                  />
                ))}
              </div>
              <span style={{ fontWeight: 700, fontSize: '14px' }}>{product.averageRating || '5.0'}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                ({product.numReviews || reviews.length} customer reviews)
              </span>
            </div>

            {/* Price & Stock Status Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px',
                padding: '14px 0',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)' }}>
                {formatCurrency(product.price)}
              </div>
              <span className={`badge ${getStatusBadgeClass(product.inventoryStatus)}`} style={{ padding: '6px 14px', fontSize: '13px' }}>
                {product.inventoryStatus}
              </span>
            </div>

            {/* Intelligent Inventory Details Alert */}
            {isOutOfStock ? (
              <div className="alert-box alert-box-danger">
                <AlertTriangle size={18} />
                <span>Currently out of stock. Backorder alert has been dispatched to vendor.</span>
              </div>
            ) : isLowStock ? (
              <div className="alert-box alert-box-warning">
                <AlertTriangle size={18} />
                <span>Only <strong>{product.quantity}</strong> units remaining in stock. Order now before stockout.</span>
              </div>
            ) : (
              <div className="alert-box alert-box-success">
                <Package size={18} />
                <span>In Stock ({product.quantity} available in verified inventory).</span>
              </div>
            )}

            {/* Description */}
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--secondary)', marginBottom: '24px' }}>
              {product.description}
            </p>

            {/* Add to Cart Actions */}
            {(!user || user.role === 'customer') && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: '#fff' }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isOutOfStock || quantity <= 1}
                      style={{ padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 600 }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0 12px', fontWeight: 700, fontSize: '14px' }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                      disabled={isOutOfStock || quantity >= product.quantity}
                      style={{ padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 600 }}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || adding}
                    className={`btn ${added ? 'btn-success' : 'btn-primary'}`}
                    style={{ flex: 1, padding: '14px', fontSize: '15px' }}
                  >
                    {added ? (
                      <>
                        <Check size={18} /> Added to Cart
                      </>
                    ) : isOutOfStock ? (
                      'Out of Stock'
                    ) : (
                      <>
                        <ShoppingCart size={18} /> Add {quantity} to Cart
                      </>
                    )}
                  </button>
                </div>

                {cartError && (
                  <div style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '8px' }}>
                    {cartError}
                  </div>
                )}
              </div>
            )}

            {/* Value Guarantees */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                marginTop: 'auto',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Truck size={18} color="var(--primary)" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: '11px', fontWeight: 600 }}>Fast Shipping</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <ShieldCheck size={18} color="var(--success)" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: '11px', fontWeight: 600 }}>Verified Quality</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <RotateCcw size={18} color="var(--info)" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: '11px', fontWeight: 600 }}>30-Day Returns</div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '24px' }}>
            Customer Reviews & Ratings
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            {/* Reviews List */}
            <div>
              {reviews.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No reviews yet for this product. Be the first to leave feedback!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviews.map((rev) => (
                    <div key={rev._id} className="card" style={{ padding: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>
                          {rev.customerId?.name || 'Verified Buyer'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {formatDate(rev.createdAt)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={s <= rev.rating ? '#f59e0b' : '#e2e8f0'}
                            color={s <= rev.rating ? '#f59e0b' : '#cbd5e1'}
                          />
                        ))}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--secondary)', lineHeight: 1.5 }}>
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Leave a Review Form (Customers Only) */}
            <div>
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
                  Write a Customer Review
                </h3>

                {reviewSuccess && (
                  <div className="alert-box alert-box-success">{reviewSuccess}</div>
                )}
                {reviewError && (
                  <div className="alert-box alert-box-danger">{reviewError}</div>
                )}

                {isAuthenticated && user?.role === 'customer' ? (
                  <form onSubmit={handleReviewSubmit}>
                    <div className="form-group">
                      <label className="form-label">Rating (1 to 5 Stars)</label>
                      <select
                        className="form-select"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                        <option value={3}>⭐⭐⭐ (3 - Average)</option>
                        <option value={2}>⭐⭐ (2 - Below Expectations)</option>
                        <option value={1}>⭐ (1 - Poor)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Your Review</label>
                      <textarea
                        className="form-textarea"
                        required
                        placeholder="Share your thoughts about this product's performance, quality, and design..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={reviewLoading}
                      className="btn btn-primary w-full"
                    >
                      {reviewLoading ? 'Submitting Review...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                    {isAuthenticated ? (
                      <p>Only customer accounts are eligible to submit product reviews.</p>
                    ) : (
                      <p>
                        Please{' '}
                        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                          sign in as a customer
                        </Link>{' '}
                        to leave a verified rating and review.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
