import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, Clock, ShoppingBag } from 'lucide-react';
import API from '../services/api';
import Loader from '../components/Loader';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../utils/helpers';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await API.get('/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <Loader message="Fetching your order history..." />;
  }

  return (
    <div className="main-content">
      <div className="app-container">
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>My Orders</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Track your order statuses, deliveries, and past purchase receipts.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
              No Orders Found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              You haven't placed any orders yet.
            </p>
            <Link to="/products" className="btn btn-primary btn-sm">
              <ShoppingBag size={15} /> Browse Marketplace
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => (
              <div key={order._id} className="card" style={{ padding: '24px' }}>
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '14px',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 800, fontSize: '16px' }}>
                      Order #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span className={`badge ${getStatusBadgeClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> {formatDate(order.createdAt)}
                    </span>
                    <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '15px' }}>
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Quantity: {item.quantity} × {formatCurrency(item.price)}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontWeight: 700 }}>
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping & Payment Footer */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--secondary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div>
                    <strong>Delivering to:</strong> {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </div>
                  <div>
                    <strong>Payment:</strong> {order.paymentMethod} ({order.paymentStatus})
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
