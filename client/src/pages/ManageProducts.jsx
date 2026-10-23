import React, { useState, useEffect } from 'react';
import { Package, Search, Store } from 'lucide-react';
import API from '../services/api';
import Loader from '../components/Loader';
import { formatCurrency, getStatusBadgeClass } from '../utils/helpers';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/products?limit=50&search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, [search]);

  const handleToggleProductStatus = async (prod) => {
    try {
      const newStatus = prod.status === 'active' ? 'inactive' : 'active';
      const res = await API.put(`/products/${prod._id}`, { status: newStatus });
      if (res.data.success) {
        setMessage(`Product "${prod.name}" status changed to ${newStatus}`);
        setProducts((prev) =>
          prev.map((p) => (p._id === prod._id ? { ...p, status: newStatus } : p))
        );
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="main-content">
      <div className="app-container">
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Platform Catalog Oversight</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Monitor vendor product listings, inventory levels, and visibility status.
          </p>
        </div>

        {message && <div className="alert-box alert-box-success">{message}</div>}

        <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', maxWidth: '380px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search catalog products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
          </div>
        </div>

        {loading ? (
          <Loader message="Loading catalog..." />
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Vendor</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Health Status</th>
                  <th>Visibility</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200'}
                            alt={p.name}
                            style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', color: 'var(--secondary)' }}>
                          {p.vendorId?.name || 'Vendor'}
                        </span>
                      </td>
                      <td>{p.category?.name || 'General'}</td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(p.price)}</td>
                      <td>{p.quantity} units</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(p.inventoryStatus)}`}>
                          {p.inventoryStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleProductStatus(p)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '11px' }}
                        >
                          {p.status === 'active' ? 'Hide Listing' : 'Make Active'}
                        </button>
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

export default ManageProducts;
