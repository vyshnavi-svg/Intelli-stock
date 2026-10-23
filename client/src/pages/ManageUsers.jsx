import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, CheckCircle2, XCircle } from 'lucide-react';
import API from '../services/api';
import Loader from '../components/Loader';
import { formatDate } from '../utils/helpers';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (search) params.append('search', search);

      const res = await API.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

  const handleToggleStatus = async (user) => {
    try {
      const res = await API.put(`/admin/users/${user._id}/status`);
      if (res.data.success) {
        setActionSuccess(res.data.message);
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u))
        );
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <div className="main-content">
      <div className="app-container">
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>User & Merchant Management</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Review registered customers, vendors, and manage platform account access.
          </p>
        </div>

        {actionSuccess && <div className="alert-box alert-box-success">{actionSuccess}</div>}

        {/* Filter bar */}
        <div
          className="card"
          style={{
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search user name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '34px' }}
              />
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'customer', 'vendor', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`btn btn-sm ${roleFilter === role ? 'btn-primary' : 'btn-secondary'}`}
              >
                {role.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <Loader message="Loading users directory..." />
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Contact Info</th>
                  <th>Registered</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              backgroundColor: u.role === 'admin' ? '#ec4899' : u.role === 'vendor' ? '#8b5cf6' : 'var(--primary)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px',
                            }}
                          >
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'vendor' ? 'badge-info' : 'badge-primary'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        <div>{u.phone || '-'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {u.address?.city ? `${u.address.city}, ${u.address.state}` : 'No address'}
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {formatDate(u.createdAt)}
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`btn btn-sm ${u.isActive ? 'btn-secondary' : 'btn-success'}`}
                            style={{ fontSize: '11px' }}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
