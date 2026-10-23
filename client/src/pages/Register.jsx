import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Store, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      },
    };

    const res = await register(payload);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/products');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="main-content flex items-center justify-center">
      <div className="app-container" style={{ maxWidth: '520px' }}>
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
              <UserPlus size={24} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Create an Account</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Join as a customer or register your vendor storefront
            </p>
          </div>

          {error && (
            <div className="alert-box alert-box-danger">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Account Type Selection */}
            <div className="form-group">
              <label className="form-label">I want to join as:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'customer' })}
                  className={`btn ${formData.role === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '10px' }}
                >
                  <ShoppingBag size={16} /> Customer
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'vendor' })}
                  className={`btn ${formData.role === 'vendor' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '10px' }}
                >
                  <Store size={16} /> Vendor
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name / Store Name</label>
              <input
                type="text"
                name="name"
                required
                className="form-input"
                placeholder="Jane Doe or Apex Electronics"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                required
                className="form-input"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="form-input"
                  placeholder="Min 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                name="street"
                className="form-input"
                placeholder="123 Market St"
                value={formData.street}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  placeholder="Seattle"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  className="form-input"
                  placeholder="WA"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  className="form-input"
                  placeholder="98101"
                  value={formData.postalCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
              style={{ padding: '12px', marginTop: '10px' }}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
