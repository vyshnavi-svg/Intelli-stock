import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'USA',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    const payload = {
      name: formData.name,
      phone: formData.phone,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      },
    };

    const res = await updateProfile(payload);
    setLoading(false);

    if (res.success) {
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="main-content">
      <div className="app-container" style={{ maxWidth: '680px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>User Profile & Settings</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Manage your account credentials and default fulfillment address.
          </p>
        </div>

        {success && <div className="alert-box alert-box-success">{success}</div>}
        {error && <div className="alert-box alert-box-danger">{error}</div>}

        <div className="card" style={{ padding: '30px' }}>
          {/* Header Card Profile Summary */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              paddingBottom: '24px',
              borderBottom: '1px solid var(--border)',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 700,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{user?.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span className="badge badge-primary">{user?.role}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user?.email}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                required
                className="form-input"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  className="form-input"
                  value={user?.email || ''}
                  style={{ backgroundColor: '#f1f5f9' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '20px 0 12px' }}>
              Default Shipping Address
            </h3>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                name="street"
                className="form-input"
                value={formData.street}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
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
                  value={formData.postalCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: '14px', width: '100%', padding: '12px' }}
            >
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
