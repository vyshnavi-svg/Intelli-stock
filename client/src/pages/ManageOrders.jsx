import React, { useState, useEffect } from 'react';
import { Package, Calendar, Clock } from 'lucide-react';
import API from '../services/api';
import Loader from '../components/Loader';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../utils/helpers';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get('/orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load all orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await API.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      if (res.data.success) {
        setMessage(`Order #${orderId.slice(-6)} status updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((o) => o.orderStatus === statusFilter);

  if (loading) {
    return <Loader message="Loading platform orders..." />;
  }

  return (
    <div className="main-content">
      <div className="app-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Platform Order Operations</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Global ledger of all customer transactions, statuses, and fulfillment tracking.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {message && <div className="alert-box alert-box-success">{message}</div>}

        {filteredOrders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            <Package size={44} style={{ margin: '0 auto 10px' }} />
            <h3>No Orders Found</h3>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              No transactions matching the selected status filter.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredOrders.map((ord) => (
              <div key={ord._id} className="card" style={{ padding: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '12px',
                    marginBottom: '14px',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '16px' }}>
                      Order #{ord._id.slice(-6).toUpperCase()}
                    </span>
                    <span className={`badge ${getStatusBadgeClass(ord.orderStatus)}`}>
                      {ord.orderStatus}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Buyer: <strong>{ord.customerId?.name}</strong> ({ord.customerId?.email})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 800, fontSize: '16px' }}>
                      {formatCurrency(ord.totalAmount)}
                    </span>
                    <select
                      className="form-select"
                      disabled={updatingId === ord._id}
                      value={ord.orderStatus}
                      onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                      style={{ padding: '6px 10px', width: 'auto', fontSize: '13px' }}
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

                {/* Items preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  {ord.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        • <strong>{item.name}</strong> × {item.quantity}
                      </span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid #f1f5f9',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    Ship to: {ord.shippingAddress?.street}, {ord.shippingAddress?.city}, {ord.shippingAddress?.state} {ord.shippingAddress?.postalCode}
                  </span>
                  <span>Payment: {ord.paymentMethod} • Placed {formatDate(ord.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
