import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, ShoppingBag, ShieldCheck, Store, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const redirectAfterLogin = (userRole) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }

    if (userRole === 'admin') navigate('/admin/dashboard');
    else if (userRole === 'vendor') navigate('/vendor/dashboard');
    else navigate('/products');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(formData.email, formData.password);
    setLoading(false);

    if (res.success) {
      redirectAfterLogin(res.user.role);
    } else {
      setError(res.message);
    }
  };

  const handleDemoFill = async (email, password) => {
    setFormData({ email, password });
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      redirectAfterLogin(res.user.role);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="main-content flex items-center justify-center">
      <div className="app-container" style={{ maxWidth: '460px' }}>
        <div className="card" style={{ padding: '36px 30px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}
            >
              <LogIn size={24} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Welcome Back</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Sign in to manage orders, inventory, or shop
            </p>
          </div>

          {error && (
            <div className="alert-box alert-box-danger">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                required
                className="form-input"
                placeholder="you@domain.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
              style={{ padding: '12px', marginTop: '10px' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Sign In Helpers */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '10px', textAlign: 'center' }}>
              ⚡ 1-Click Examiner Demo Sign-In
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleDemoFill('customer@ecommerce.com', 'customer123')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start' }}
              >
                <User size={15} color="#2563eb" /> Sign In as Customer (customer@ecommerce.com)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('vendor@ecommerce.com', 'vendor123')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start' }}
              >
                <Store size={15} color="#8b5cf6" /> Sign In as Vendor (vendor@ecommerce.com)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin@ecommerce.com', 'admin123')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start' }}
              >
                <ShieldCheck size={15} color="#ec4899" /> Sign In as Admin (admin@ecommerce.com)
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
