import React, { useState, useEffect } from 'react';
import { Package, Calendar, Clock, CheckCircle } from 'lucide-react';
import API from '../services/api';
import Loader from '../components/Loader';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../utils/helpers';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [success, setSuccess] = useState('');

  const fetchVendorOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get('/orders/vendor/me');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching vendor orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await API.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      if (res.data.success) {
        setSuccess(`Order #${orderId.slice(-6)} status updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <Loader message="Loading customer orders..." />;
  }

  return (
    <div className="main-content">
      <div className="app-container">
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Vendor Customer Orders</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Manage customer purchases, shipment statuses, and fulfillment updates.
          </p>
        </div>

        {success && <div className="alert-box alert-box-success">{success}</div>}

        {orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            <Package size={44} style={{ margin: '0 auto 10px' }} />
            <h3>No Customer Orders Yet</h3>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              When customers order your products from the marketplace, they will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((ord) => (
              <div key={ord._id} className="card" style={{ padding: '24px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '14px',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 800, fontSize: '16px' }}>
                      Order #{ord._id.slice(-6).toUpperCase()}
                    </span>
                    <span className={`badge ${getStatusBadgeClass(ord.orderStatus)}`}>
                      {ord.orderStatus}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {formatDate(ord.createdAt)}
                    </span>
                    <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '15px' }}>
                      Vendor Subtotal: {formatCurrency(ord.vendorSubtotal)}
                    </span>

                    {/* Status updater dropdown */}
                    <select
                      className="form-select"
                      disabled={updatingId === ord._id}
                      value={ord.orderStatus}
                      onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                      style={{ padding: '6px 12px', width: 'auto', fontSize: '13px' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {ord.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          <div style={{ color: 'var(--text-muted)' }}>
                            Ordered: {item.quantity} units @ {formatCurrency(item.price)} each
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping info */}
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
                    <strong>Customer:</strong> {ord.customerId?.name} ({ord.customerId?.email})
                  </div>
                  <div>
                    <strong>Destination:</strong> {ord.shippingAddress?.street}, {ord.shippingAddress?.city}, {ord.shippingAddress?.state} {ord.shippingAddress?.postalCode}
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

export default VendorOrders;
