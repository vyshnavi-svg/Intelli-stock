import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Boxes,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Sliders,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import API from '../services/api';
import Loader from '../components/Loader';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../utils/helpers';

const VendorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await API.get('/inventory/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load vendor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <Loader message="Analyzing vendor inventory and sales metrics..." />;
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const recentAlerts = data?.recentAlerts || [];

  return (
    <div className="main-content">
      <div className="app-container">
        {/* Dashboard Title & Quick Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Vendor Analytics & Inventory Dashboard</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Real-time telemetry, automated stock health classification, and sales performance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/vendor/inventory" className="btn btn-outline btn-sm">
              <Sliders size={15} /> Inventory Hub
            </Link>
            <Link to="/vendor/products" className="btn btn-primary btn-sm">
              <Package size={15} /> Manage Products
            </Link>
          </div>
        </div>

        {/* 8 Primary KPI Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {/* Card 1: Total Revenue */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Revenue</span>
              <div style={{ background: '#ecfdf5', color: '#10b981', padding: '6px', borderRadius: '8px' }}>
                <DollarSign size={18} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Across {stats.totalOrders || 0} orders
            </div>
          </div>

          {/* Card 2: Total Products */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Products</span>
              <div style={{ background: '#eff6ff', color: '#2563eb', padding: '6px', borderRadius: '8px' }}>
                <Package size={18} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
              {stats.totalProducts || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              In your store catalog
            </div>
          </div>

          {/* Card 3: Total Stock Units */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Inventory Units</span>
              <div style={{ background: '#f5f3ff', color: '#8b5cf6', padding: '6px', borderRadius: '8px' }}>
                <Boxes size={18} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
              {stats.totalStock || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Value: {formatCurrency(stats.totalInventoryValue)}
            </div>
          </div>

          {/* Card 4: Low Stock Alert Count */}
          <div className="card" style={{ padding: '20px', borderColor: stats.lowStockCount > 0 ? '#fde68a' : 'var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#b45309' }}>Low Stock Items</span>
              <div style={{ background: '#fffbeb', color: '#f59e0b', padding: '6px', borderRadius: '8px' }}>
                <AlertTriangle size={18} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#b45309' }}>
              {stats.lowStockCount || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Current stock ≤ Minimum
            </div>
          </div>

          {/* Card 5: Out of Stock Count */}
          <div className="card" style={{ padding: '20px', borderColor: stats.outOfStockCount > 0 ? '#fecaca' : 'var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>Out of Stock</span>
              <div style={{ background: '#fef2f2', color: '#ef4444', padding: '6px', borderRadius: '8px' }}>
                <AlertCircle size={18} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626' }}>
              {stats.outOfStockCount || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Critical 0 stock units
            </div>
          </div>

          {/* Card 6: Overstocked Count */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Overstock Items</span>
              <div style={{ background: '#eef2ff', color: '#6366f1', padding: '6px', borderRadius: '8px' }}>
                <Boxes size={18} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
              {stats.overstockCount || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Stock &gt; Maximum capacity
            </div>
          </div>

          {/* Card 7: Healthy Stock Count */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Healthy Products</span>
              <div style={{ background: '#ecfdf5', color: '#10b981', padding: '6px', borderRadius: '8px' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)' }}>
              {stats.healthyCount || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Optimal inventory levels
            </div>
          </div>

          {/* Card 8: Items Sold */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Units Sold</span>
              <div style={{ background: '#fdf2f8', color: '#ec4899', padding: '6px', borderRadius: '8px' }}>
                <ShoppingCart size={18} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
              {stats.totalItemsSold || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Fulfilled to customers
            </div>
          </div>
        </div>

        {/* Recharts Analytics Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          {/* Chart 1: Stock vs Threshold Comparison */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
              Stock vs Minimum Threshold Comparison
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Products at or near the red line require immediate reordering.
            </p>
            <div style={{ width: '100%', height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.stockComparison || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="currentStock" name="Current Stock" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="minimumStock" name="Min Threshold" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Inventory Health Distribution */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
              Inventory Health Classification
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Automatic categorization computed by the intelligent inventory engine.
            </p>
            <div style={{ width: '100%', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.stockDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(charts.stockDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Inventory Alerts Feed */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Recent Intelligent Inventory Alerts</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                System-generated triggers when stock drops below threshold or sells out.
              </p>
            </div>
            <Link to="/vendor/inventory" className="btn btn-secondary btn-sm">
              View All in Inventory Hub <ArrowRight size={14} />
            </Link>
          </div>

          {recentAlerts.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No critical alerts. All inventory items are within healthy operating thresholds.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentAlerts.map((alert) => (
                <div
                  key={alert._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: alert.severity === 'HIGH' ? '#fef2f2' : alert.severity === 'MEDIUM' ? '#fffbeb' : '#f8fafc',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShieldAlert
                      size={18}
                      color={alert.severity === 'HIGH' ? '#dc2626' : alert.severity === 'MEDIUM' ? '#d97706' : '#2563eb'}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{alert.message}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Triggered on {formatDate(alert.createdAt)} • Severity: <strong>{alert.severity}</strong>
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${alert.alertType === 'LOW_STOCK' ? 'badge-warning' : alert.alertType === 'OUT_OF_STOCK' ? 'badge-danger' : 'badge-info'}`}>
                    {alert.alertType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
