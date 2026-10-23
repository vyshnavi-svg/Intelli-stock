import React, { useState, useEffect } from 'react';
import {
  Sliders,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Boxes,
  CheckCircle,
  DollarSign,
  TrendingDown,
  ShieldCheck,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import API from '../services/api';
import Loader from '../components/Loader';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../utils/helpers';

const InventoryDashboard = () => {
  const [activeTab, setActiveTab] = useState('reorder'); // 'reorder', 'lowStock', 'outOfStock', 'overstock', 'alerts'
  const [suggestions, setSuggestions] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [overstock, setOverstock] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [restockingId, setRestockingId] = useState(null);

  const fetchAllInventoryData = async () => {
    try {
      setLoading(true);
      const [reorderRes, lowRes, outRes, overRes, alertRes] = await Promise.all([
        API.get('/inventory/reorder-suggestions'),
        API.get('/inventory/low-stock'),
        API.get('/inventory/out-of-stock'),
        API.get('/inventory/overstock'),
        API.get('/inventory/alerts'),
      ]);

      if (reorderRes.data.success) setSuggestions(reorderRes.data.suggestions);
      if (lowRes.data.success) setLowStock(lowRes.data.products);
      if (outRes.data.success) setOutOfStock(outRes.data.products);
      if (overRes.data.success) setOverstock(overRes.data.products);
      if (alertRes.data.success) setAlerts(alertRes.data.alerts);
    } catch (err) {
      console.error('Failed to load inventory intelligence datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllInventoryData();
  }, []);

  const handleRestockSuggested = async (item) => {
    const qty = item.suggestedReorder || (item.maximumStock - item.quantity);
    if (!qty || qty <= 0) return;

    try {
      setRestockingId(item._id);
      const res = await API.put(`/products/${item._id}/stock`, { restockAmount: qty });
      if (res.data.success) {
        setActionSuccess(`Successfully replenished ${qty} units for "${item.name}"!`);
        fetchAllInventoryData();
        setTimeout(() => setActionSuccess(''), 3500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Restock failed');
    } finally {
      setRestockingId(null);
    }
  };

  const handleMarkAlertRead = async (alertId) => {
    try {
      const res = await API.put(`/inventory/alerts/${alertId}/read`);
      if (res.data.success) {
        setAlerts((prev) =>
          prev.map((a) => (a._id === alertId ? { ...a, isRead: true } : a))
        );
      }
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  const handleMarkAllAlertsRead = async () => {
    try {
      const res = await API.put('/inventory/alerts/read-all');
      if (res.data.success) {
        setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  if (loading) {
    return <Loader message="Running intelligent inventory telemetry and reorder optimization..." />;
  }

  return (
    <div className="main-content">
      <div className="app-container">
        {/* Page Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', marginBottom: '6px' }}>
            <Sliders size={16} /> Intelligent Stock Intelligence Engine
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Inventory Hub & Reorder Optimization</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Automated monitoring of stock depletion, depletion thresholds, capital lockup, and intelligent reorder suggestions.
          </p>
        </div>

        {actionSuccess && <div className="alert-box alert-box-success">{actionSuccess}</div>}

        {/* Intelligence Formula Explanatory Callout Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius)',
            padding: '20px 24px',
            marginBottom: '30px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#1e40af', marginBottom: '6px' }}>
              🧠 Intelligent Decision Matrix
            </div>
            <div style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: 1.6 }}>
              • <strong>Low Stock:</strong> Current Stock ≤ Minimum Stock<br />
              • <strong>Out of Stock:</strong> Current Stock == 0<br />
              • <strong>Overstock:</strong> Current Stock &gt; Maximum Stock<br />
              • <strong>Healthy:</strong> Minimum &lt; Current Stock ≤ Maximum
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#1e40af', marginBottom: '6px' }}>
              📐 Automated Reorder Formula
            </div>
            <div style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: 1.6 }}>
              <code style={{ background: '#ffffff', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>
                Suggested Reorder = Maximum Stock - Current Stock
              </code>
              <div style={{ marginTop: '6px' }}>
                Prevents stockouts while eliminating warehouse overfill.
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '2px solid var(--border)',
            marginBottom: '24px',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('reorder')}
            className="btn"
            style={{
              borderRadius: '0',
              borderBottom: activeTab === 'reorder' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'reorder' ? 'var(--primary)' : 'var(--secondary)',
              fontWeight: 700,
              padding: '12px 18px',
              background: 'none',
            }}
          >
            <RefreshCw size={15} /> Reorder Suggestions ({suggestions.length})
          </button>

          <button
            onClick={() => setActiveTab('lowStock')}
            className="btn"
            style={{
              borderRadius: '0',
              borderBottom: activeTab === 'lowStock' ? '3px solid #f59e0b' : '3px solid transparent',
              color: activeTab === 'lowStock' ? '#b45309' : 'var(--secondary)',
              fontWeight: 700,
              padding: '12px 18px',
              background: 'none',
            }}
          >
            <AlertTriangle size={15} /> Low Stock ({lowStock.length})
          </button>

          <button
            onClick={() => setActiveTab('outOfStock')}
            className="btn"
            style={{
              borderRadius: '0',
              borderBottom: activeTab === 'outOfStock' ? '3px solid #ef4444' : '3px solid transparent',
              color: activeTab === 'outOfStock' ? '#dc2626' : 'var(--secondary)',
              fontWeight: 700,
              padding: '12px 18px',
              background: 'none',
            }}
          >
            <AlertCircle size={15} /> Out of Stock ({outOfStock.length})
          </button>

          <button
            onClick={() => setActiveTab('overstock')}
            className="btn"
            style={{
              borderRadius: '0',
              borderBottom: activeTab === 'overstock' ? '3px solid #6366f1' : '3px solid transparent',
              color: activeTab === 'overstock' ? '#6366f1' : 'var(--secondary)',
              fontWeight: 700,
              padding: '12px 18px',
              background: 'none',
            }}
          >
            <Boxes size={15} /> Overstock ({overstock.length})
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className="btn"
            style={{
              borderRadius: '0',
              borderBottom: activeTab === 'alerts' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'alerts' ? 'var(--primary)' : 'var(--secondary)',
              fontWeight: 700,
              padding: '12px 18px',
              background: 'none',
            }}
          >
            <ShieldCheck size={15} /> All Alerts ({alerts.filter((a) => !a.isRead).length} unread)
          </button>
        </div>

        {/* TAB 1: REORDER SUGGESTIONS */}
        {activeTab === 'reorder' && (
          <div>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Algorithmic Reorder Recommendations</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Computed dynamically based on current stock, minimum trigger thresholds, and maximum capacity.
                </p>
              </div>
            </div>

            {suggestions.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle size={44} color="var(--success)" style={{ margin: '0 auto 12px' }} />
                <h3>All Inventory Levels Healthy</h3>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>
                  No products are currently at or below their minimum reorder thresholds.
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Min Threshold</th>
                      <th>Max Capacity</th>
                      <th>Suggested Reorder</th>
                      <th>Est. Cost</th>
                      <th>Urgency</th>
                      <th>Quick Replenish</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestions.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200'}
                              alt={item.name}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                            <div>
                              <strong style={{ display: 'block' }}>{item.name}</strong>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {formatCurrency(item.unitPrice)} / unit
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>{item.category}</td>
                        <td>
                          <strong style={{ color: item.currentStock === 0 ? '#dc2626' : '#d97706' }}>
                            {item.currentStock} units
                          </strong>
                        </td>
                        <td>{item.minimumStock}</td>
                        <td>{item.maximumStock}</td>
                        <td>
                          <span
                            style={{
                              backgroundColor: '#eff6ff',
                              color: 'var(--primary)',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontWeight: 800,
                              fontSize: '13px',
                            }}
                          >
                            +{item.suggestedReorder} units
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>{formatCurrency(item.estimatedCost)}</td>
                        <td>
                          <span className={`badge ${item.urgency === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`}>
                            {item.urgency}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleRestockSuggested(item)}
                            disabled={restockingId === item._id}
                            className="btn btn-primary btn-sm"
                            style={{ minWidth: '120px' }}
                          >
                            {restockingId === item._id ? (
                              'Updating...'
                            ) : (
                              <>
                                <RefreshCw size={13} /> Restock {item.suggestedReorder}
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LOW STOCK */}
        {activeTab === 'lowStock' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Low Stock Monitoring</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Products where Current Stock ≤ Minimum Stock threshold.
              </p>
            </div>

            {lowStock.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No low-stock items detected.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Stock Remaining</th>
                      <th>Min Trigger</th>
                      <th>Max Limit</th>
                      <th>Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((p) => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td>{p.category?.name}</td>
                        <td>
                          <strong style={{ color: '#d97706' }}>{p.quantity} units left</strong>
                        </td>
                        <td>{p.minimumStock}</td>
                        <td>{p.maximumStock}</td>
                        <td style={{ fontWeight: 700 }}>{formatCurrency(p.price)}</td>
                        <td>
                          <button
                            onClick={() => handleRestockSuggested(p)}
                            disabled={restockingId === p._id}
                            className="btn btn-primary btn-sm"
                          >
                            <RefreshCw size={13} /> Quick Restock (+{p.maximumStock - p.quantity})
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OUT OF STOCK */}
        {activeTab === 'outOfStock' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626' }}>
                Critical Out-of-Stock Products
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Products with 0 inventory that cannot be purchased by marketplace customers.
              </p>
            </div>

            {outOfStock.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Zero stockouts! All listed products have inventory available.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Current Units</th>
                      <th>Capacity Target</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outOfStock.map((p) => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 700, color: '#dc2626' }}>{p.name}</td>
                        <td>{p.category?.name}</td>
                        <td>
                          <span className="badge badge-danger">0 Units (Depleted)</span>
                        </td>
                        <td>{p.maximumStock} units</td>
                        <td>
                          <button
                            onClick={() => handleRestockSuggested(p)}
                            disabled={restockingId === p._id}
                            className="btn btn-danger btn-sm"
                          >
                            <RefreshCw size={13} /> Restock Full Capacity (+{p.maximumStock})
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: OVERSTOCK */}
        {activeTab === 'overstock' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Overstock Analysis</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Products where stock exceeds the maximum threshold, resulting in potential capital lockup.
              </p>
            </div>

            {overstock.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No overstocked items found. Inventory flow is balanced.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Current Units</th>
                      <th>Maximum Threshold</th>
                      <th>Surplus Units</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overstock.map((p) => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td><strong>{p.quantity}</strong></td>
                        <td>{p.maximumStock}</td>
                        <td>
                          <span style={{ color: '#6366f1', fontWeight: 700 }}>
                            +{p.quantity - p.maximumStock} surplus
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-info">Overstock</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ALL ALERTS */}
        {activeTab === 'alerts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Inventory Alerts Archive</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Complete log of stock status transitions, notifications, and alert severity.
                </p>
              </div>

              {alerts.some((a) => !a.isRead) && (
                <button onClick={handleMarkAllAlertsRead} className="btn btn-secondary btn-sm">
                  Mark All Read
                </button>
              )}
            </div>

            {alerts.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No inventory alerts recorded in the database.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {alerts.map((alt) => (
                  <div
                    key={alt._id}
                    className="card"
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: alt.isRead ? '#ffffff' : '#f8fafc',
                      borderLeft: `4px solid ${alt.severity === 'HIGH' ? '#ef4444' : alt.severity === 'MEDIUM' ? '#f59e0b' : '#3b82f6'}`,
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`badge ${alt.severity === 'HIGH' ? 'badge-danger' : alt.severity === 'MEDIUM' ? 'badge-warning' : 'badge-primary'}`}>
                          {alt.severity} Priority
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>
                          {alt.alertType}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {formatDate(alt.createdAt)}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--secondary)', marginTop: '6px' }}>
                        {alt.message}
                      </div>
                    </div>

                    {!alt.isRead && (
                      <button
                        onClick={() => handleMarkAlertRead(alt._id)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Check size={13} /> Mark Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryDashboard;
