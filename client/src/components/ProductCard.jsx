import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Check } from 'lucide-react';
import { formatCurrency, getStatusBadgeClass } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isOutOfStock = product.quantity === 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isOutOfStock) return;

    setAdding(true);
    setErrorMsg('');
    const res = await addToCart(product._id, 1);
    setAdding(false);

    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      setErrorMsg(res.message);
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        position: 'relative',
        height: '100%',
      }}
    >
      {/* Inventory Status Badge */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 2 }}>
        <span className={`badge ${getStatusBadgeClass(product.inventoryStatus)}`}>
          {product.inventoryStatus}
        </span>
      </div>

      {/* Stock level counter pill */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          zIndex: 2,
          backgroundColor: 'rgba(255,255,255,0.92)',
          padding: '3px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
          color: product.quantity <= product.minimumStock ? '#d97706' : 'var(--text-muted)',
          border: '1px solid var(--border)',
        }}
      >
        {isOutOfStock ? '0 in stock' : `${product.quantity} left`}
      </div>

      {/* Thumbnail */}
      <Link
        to={`/products/${product._id}`}
        style={{
          display: 'block',
          width: '100%',
          height: '200px',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '14px',
          backgroundColor: '#f1f5f9',
        }}
      >
        <img
          src={product.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600'}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </Link>

      {/* Category */}
      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '4px' }}>
        {product.category?.name || 'Category'}
      </div>

      {/* Product Title */}
      <Link
        to={`/products/${product._id}`}
        style={{
          fontWeight: 700,
          fontSize: '15px',
          color: 'var(--text-main)',
          marginBottom: '6px',
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1,
        }}
      >
        {product.name}
      </Link>

      {/* Rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
        <Star size={14} fill="#f59e0b" color="#f59e0b" />
        <span style={{ fontSize: '12px', fontWeight: 600 }}>{product.averageRating || '5.0'}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          ({product.numReviews || 0})
        </span>
      </div>

      {/* Price & Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Price</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
            {formatCurrency(product.price)}
          </div>
        </div>

        {(!user || user.role === 'customer') && (
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`btn btn-sm ${added ? 'btn-success' : 'btn-primary'}`}
            style={{ minWidth: '95px' }}
          >
            {added ? (
              <>
                <Check size={14} /> Added
              </>
            ) : isOutOfStock ? (
              'Sold Out'
            ) : (
              <>
                <ShoppingCart size={14} /> Add
              </>
            )}
          </button>
        )}
      </div>

      {errorMsg && (
        <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '6px', textAlign: 'center' }}>
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default ProductCard;
