import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/helpers';
import API from '../services/api';

const Checkout = () => {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    street: user?.address?.street || '742 Evergreen Terrace',
    city: user?.address?.city || 'Springfield',
    state: user?.address?.state || 'OR',
    postalCode: user?.address?.postalCode || '97477',
    country: user?.address?.country || 'USA',
  });

  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderCompleted, setOrderCompleted] = useState(null);

  const handleAddressChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!cart.items || cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const orderPayload = {
        items: cart.items.map((item) => ({
          product: item.product._id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          vendorId: item.product.vendorId,
          image: item.product.image,
        })),
        shippingAddress,
        paymentMethod,
      };

      const res = await API.post('/orders', orderPayload);
      if (res.data.success) {
        setOrderCompleted(res.data.order);
        await refreshCart();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (orderCompleted) {
    return (
      <div className="main-content flex items-center justify-center">
        <div className="app-container" style={{ maxWidth: '560px', textAlign: 'center' }}>
          <div className="card" style={{ padding: '40px 30px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
              Order Confirmed!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              Thank you for your purchase. Order #{orderCompleted._id.slice(-6)} has been placed.
            </p>

            <div
              style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                marginBottom: '24px',
                textAlign: 'left',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Paid:</span>
                <strong>{formatCurrency(orderCompleted.totalAmount)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span className="badge badge-primary">{orderCompleted.orderStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment:</span>
                <span>{orderCompleted.paymentMethod}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/orders" className="btn btn-primary" style={{ flex: 1 }}>
                View Order History
              </Link>
              <Link to="/products" className="btn btn-secondary" style={{ flex: 1 }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="app-container">
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '28px' }}>
          Checkout & Finalize Order
        </h1>

        {error && <div className="alert-box alert-box-danger">{error}</div>}

        <form onSubmit={handlePlaceOrder}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '30px',
              alignItems: 'flex-start',
            }}
          >
            {/* Left: Shipping & Payment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Shipping Address */}
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                  1. Shipping Information
                </h3>

                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    required
                    className="form-input"
                    value={shippingAddress.street}
                    onChange={handleAddressChange}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      className="form-input"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      required
                      className="form-input"
                      value={shippingAddress.state}
                      onChange={handleAddressChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      className="form-input"
                      value={shippingAddress.postalCode}
                      onChange={handleAddressChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      name="country"
                      required
                      className="form-input"
                      value={shippingAddress.country}
                      onChange={handleAddressChange}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                  2. Payment Method
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { id: 'Credit Card', label: 'Credit / Debit Card (Instant Simulation)' },
                    { id: 'Cash on Delivery', label: 'Cash on Delivery (Pay upon delivery)' },
                    { id: 'Demo Payment', label: 'Demo Gateway (Test Payment)' },
                  ].map((method) => (
                    <label
                      key={method.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        border: '1px solid',
                        borderColor: paymentMethod === method.id ? 'var(--primary)' : 'var(--border)',
                        borderRadius: 'var(--radius)',
                        backgroundColor: paymentMethod === method.id ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      {method.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Order Summary Preview & Button */}
            <div className="card" style={{ padding: '24px', position: 'sticky', top: '90px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
                Items in Order ({cart.itemCount})
              </h3>

              <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '16px' }}>
                {cart.items.map((i) => (
                  <div
                    key={i._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '13px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{i.product?.name}</div>
                      <div style={{ color: 'var(--text-muted)' }}>Qty: {i.quantity} × {formatCurrency(i.price)}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      {formatCurrency(i.price * i.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary)' }}>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(cart.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary)' }}>
                  <span>Tax (8%):</span>
                  <span>{formatCurrency(cart.tax)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary)' }}>
                  <span>Shipping:</span>
                  <span>{cart.shipping === 0 ? 'FREE' : formatCurrency(cart.shipping)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 800,
                    fontSize: '18px',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '12px',
                    color: 'var(--primary)',
                  }}
                >
                  <span>Total:</span>
                  <span>{formatCurrency(cart.total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cart.items.length === 0}
                className="btn btn-primary w-full"
                style={{ padding: '14px', fontSize: '15px' }}
              >
                {loading ? 'Processing Order...' : `Confirm & Place Order (${formatCurrency(cart.total)})`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
