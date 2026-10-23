import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, Zap, Activity, Box, RefreshCw } from 'lucide-react';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { login } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoLoginStatus, setDemoLoginStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          API.get('/products?limit=8'),
          API.get('/admin/categories/public'),
        ]);

        if (prodRes.data.success) {
          setFeaturedProducts(prodRes.data.products);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
      } catch (err) {
        console.error('Home page load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleQuickLogin = async (email, password, roleLabel) => {
    setDemoLoginStatus(`Logging in as ${roleLabel}...`);
    const res = await login(email, password);
    if (res.success) {
      setDemoLoginStatus(`Logged in as ${roleLabel}!`);
      setTimeout(() => setDemoLoginStatus(''), 2000);
    } else {
      setDemoLoginStatus(`Failed: ${res.message}`);
      setTimeout(() => setDemoLoginStatus(''), 3000);
    }
  };

  return (
    <div className="main-content">
      <div className="app-container">
        {/* Quick Demo Switcher Banner */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '14px 20px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
              ⚡ 1-Click Quick Demo Sign-In:
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Instant role switching for examiners:
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleQuickLogin('customer@ecommerce.com', 'customer123', 'Customer')}
              className="demo-badge-btn"
            >
              🛒 Demo Customer
            </button>
            <button
              onClick={() => handleQuickLogin('vendor@ecommerce.com', 'vendor123', 'Vendor')}
              className="demo-badge-btn"
            >
              🏪 Demo Vendor
            </button>
            <button
              onClick={() => handleQuickLogin('admin@ecommerce.com', 'admin123', 'Admin')}
              className="demo-badge-btn"
            >
              👑 Demo Admin
            </button>
          </div>
          {demoLoginStatus && (
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', width: '100%', textAlign: 'right' }}>
              {demoLoginStatus}
            </div>
          )}
        </div>

        {/* Hero Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '48px 40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            alignItems: 'center',
            marginBottom: '40px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.15)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '16px',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Zap size={14} color="#fcd34d" />
              Real-Time Intelligent Inventory Engine
            </div>
            <h1
              style={{
                fontSize: '36px',
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: '16px',
                letterSpacing: '-0.5px',
              }}
            >
              Intelligent Multi-Vendor Inventory & E-Commerce
            </h1>
            <p
              style={{
                fontSize: '16px',
                opacity: 0.9,
                lineHeight: 1.6,
                marginBottom: '28px',
                maxWidth: '520px',
              }}
            >
              A full-stack MERN application with automated stock level classification, low-stock alerts, out-of-stock prevention, and mathematical reorder suggestions.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link
                to="/products"
                className="btn"
                style={{
                  backgroundColor: '#ffffff',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  padding: '12px 24px',
                }}
              >
                <ShoppingBag size={18} /> Explore Marketplace
              </Link>
              <Link
                to="/vendor/dashboard"
                className="btn"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(4px)',
                  padding: '12px 24px',
                }}
              >
                Vendor Dashboard <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* System Feature Highlights Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: 700 }}>Core Intelligent Features</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ background: '#f59e0b', padding: '8px', borderRadius: '8px', color: '#fff' }}>
                <Activity size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>Automated Low Stock Detection</div>
                <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
                  If Current Stock ≤ Minimum Stock, generates real-time alerts.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ background: '#10b981', padding: '8px', borderRadius: '8px', color: '#fff' }}>
                <RefreshCw size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>Smart Reorder Formula</div>
                <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
                  Reorder Quantity = Maximum Stock - Current Stock.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ background: '#6366f1', padding: '8px', borderRadius: '8px', color: '#fff' }}>
                <Box size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>Overstock & Out of Stock Monitoring</div>
                <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
                  Prevents capital lock-up and stockout loss for vendors.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        {categories.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Browse by Category</h2>
              <Link to="/products" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat._id}`}
                  className="card"
                  style={{
                    padding: '16px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: '#f1f5f9',
                    }}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                    {cat.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Products */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Live Marketplace Catalog</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Products populated directly from MongoDB with live stock health indicators.
              </p>
            </div>
            <Link to="/products" className="btn btn-outline btn-sm">
              View All Products
            </Link>
          </div>

          {loading ? (
            <Loader message="Loading catalog from database..." />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '20px',
              }}
            >
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
