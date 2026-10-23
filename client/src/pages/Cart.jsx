import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/helpers';
import Loader from '../components/Loader';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return <Loader message="Updating cart..." />;
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="main-content flex items-center justify-center">
        <div className="app-container" style={{ maxWidth: '520px', textAlign: 'center' }}>
          <div className="card" style={{ padding: '60px 24px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <ShoppingBag size={32} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
              Your Shopping Cart is Empty
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Looks like you haven't added any items yet. Explore our verified marketplace products.
            </p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="app-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Shopping Cart</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Review your items before secure checkout
            </p>
          </div>
          <button onClick={clearCart} className="btn btn-secondary btn-sm">
            <Trash2 size={14} /> Clear Cart
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            alignItems: 'flex-start',
          }}
        >
          {/* Cart Items Table/List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {cart.items.map((item) => {
              const product = item.product || {};
              const isOverStock = product.quantity < item.quantity;

              return (
                <div
                  key={item._id || product._id}
                  className="card"
                  style={{
                    padding: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    flexWrap: 'wrap',
                  }}
                >
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400'}
                    alt={product.name}
                    style={{
                      width: '74px',
                      height: '74px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      backgroundColor: '#f1f5f9',
                    }}
                  />

                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <Link
                      to={`/products/${product._id}`}
                      style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}
                    >
                      {product.name}
                    </Link>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Unit: {formatCurrency(item.price)}
                    </div>
                    {isOverStock && (
                      <div style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>
                        ⚠️ Only {product.quantity} units available in stock!
                      </div>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '6px' }}>
                    <button
                      onClick={() => updateQuantity(product._id, Math.max(1, item.quantity - 1))}
                      style={{ padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0 10px', fontSize: '13px', fontWeight: 700 }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product._id, item.quantity + 1)}
                      disabled={item.quantity >= product.quantity}
                      style={{ padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>

                  {/* Total for item */}
                  <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: 800, fontSize: '16px' }}>
                    {formatCurrency(item.price * item.quantity)}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(product._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                      padding: '6px',
                    }}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Order Summary Card */}
          <div className="card" style={{ padding: '24px', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary)' }}>
                <span>Subtotal ({cart.itemCount} items)</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary)' }}>
                <span>Estimated Tax (8%)</span>
                <span>{formatCurrency(cart.tax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary)' }}>
                <span>Shipping</span>
                <span>{cart.shipping === 0 ? 'FREE' : formatCurrency(cart.shipping)}</span>
              </div>
              {cart.subtotal > 100 && (
                <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>
                  🎉 Free shipping applied on orders over $100!
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '18px',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '14px',
                  color: 'var(--text-main)',
                }}
              >
                <span>Estimated Total</span>
                <span style={{ color: 'var(--primary)' }}>{formatCurrency(cart.total)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary w-full"
              style={{ padding: '14px', fontSize: '15px' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <ShieldCheck size={15} color="var(--success)" />
              Secure 256-bit Encrypted Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
