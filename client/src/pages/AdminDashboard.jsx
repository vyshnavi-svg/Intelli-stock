import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  Package,
  Layers,
  ArrowRight,
  TrendingUp,
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

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return <Loader message="Compiling platform-wide telemetry & analytics..." />;
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="main-content">
      <div className="app-container">
        {/* Header */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ec4899', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', marginBottom: '4px' }}>
              <ShieldCheck size={16} /> Platform Administration
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Master Admin Control Center</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Platform-wide multi-vendor analytics, system users oversight, and global sales metrics.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/admin/users" className="btn btn-secondary btn-sm">
              <Users size={14} /> Manage Users
            </Link>
            <Link to="/admin/orders" className="btn btn-primary btn-sm">
              <Package size={14} /> Manage Orders
            </Link>
          </div>
        </div>

        {/* Platform KPI Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {/* Revenue */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Platform Gross Volume</span>
              <div style={{ background: '#ecfdf5', color: '#10b981', padding: '6px', borderRadius: '8px' }}>
                <DollarSign size={18} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {stats.totalOrders || 0} total transactions
            </div>
          </div>

          {/* Total Users */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Registered Users</span>
              <div style={{ background: '#eff6ff', color: '#2563eb', padding: '6px', borderRadius: '8px' }}>
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
              {stats.totalUsers || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {stats.totalCustomers || 0} buyers • {stats.totalVendors || 0} vendors
            </div>
          </div>

          {/* Total Products */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Catalog Items</span>
              <div style={{ background: '#f5f3ff', color: '#8b5cf6', padding: '6px', borderRadius: '8px' }}>
                <Package size={18} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
              {stats.totalProducts || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Across {stats.totalCategories || 0} categories
            </div>
          </div>

          {/* Low / Out Stock Health Alerts */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>Stockout Warnings</span>
              <div style={{ background: '#fef2f2', color: '#ef4444', padding: '6px', borderRadius: '8px' }}>
                <ShieldCheck size={18} />
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626' }}>
              {stats.outOfStockCount || 0} Out / {stats.lowStockCount || 0} Low
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Requiring vendor attention
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          {/* User Role Distribution */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>User Role Distribution</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Breakdown of customer buyers vs verified merchant sellers.
            </p>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.userDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(charts.userDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System Inventory Health Breakdown */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
              Global Stock Status Breakdown
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Aggregate health of all active SKUs across vendors.
            </p>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.inventoryStatusDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Products" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {(charts.inventoryStatusDistribution || []).map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Recent Platform Orders</h3>
            <Link to="/admin/orders" className="btn btn-secondary btn-sm">
              View All Orders <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                      No orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord._id}>
                      <td style={{ fontWeight: 700 }}>#{ord._id.slice(-6).toUpperCase()}</td>
                      <td>{ord.customerId?.name || 'Customer'}</td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(ord.totalAmount)}</td>
                      <td>{ord.paymentMethod}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(ord.orderStatus)}`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {formatDate(ord.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
