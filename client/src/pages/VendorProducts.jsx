import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RefreshCw, X, PackagePlus, Check } from 'lucide-react';
import API from '../services/api';
import Loader from '../components/Loader';
import { formatCurrency, getStatusBadgeClass } from '../utils/helpers';

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const initialForm = {
    name: '',
    description: '',
    price: '',
    category: '',
    quantity: 10,
    minimumStock: 5,
    maximumStock: 30,
    image: '',
    status: 'active',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        API.get('/products/vendor/me'),
        API.get('/admin/categories/public'),
      ]);

      if (prodRes.data.success) {
        setProducts(prodRes.data.products);
      }
      if (catRes.data.success) {
        setCategories(catRes.data.categories);
        if (catRes.data.categories.length > 0 && !formData.category) {
          setFormData((prev) => ({ ...prev, category: catRes.data.categories[0]._id }));
        }
      }
    } catch (err) {
      console.error('Error fetching vendor products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      ...initialForm,
      category: categories[0]?._id || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      category: prod.category?._id || prod.category,
      quantity: prod.quantity,
      minimumStock: prod.minimumStock,
      maximumStock: prod.maximumStock,
      image: prod.image || '',
      status: prod.status,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      if (editingProduct) {
        const res = await API.put(`/products/${editingProduct._id}`, formData);
        if (res.data.success) {
          setSuccess('Product updated successfully');
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        const res = await API.post('/products', formData);
        if (res.data.success) {
          setSuccess('Product created successfully');
          setIsModalOpen(false);
          fetchData();
        }
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await API.delete(`/products/${id}`);
      if (res.data.success) {
        setProducts(products.filter((p) => p._id !== id));
        setSuccess('Product deleted');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleQuickRestock = async (product) => {
    const suggested = Math.max(5, product.maximumStock - product.quantity);
    const amount = window.prompt(
      `Restock "${product.name}":\nCurrent stock: ${product.quantity} | Min: ${product.minimumStock} | Max: ${product.maximumStock}\nSuggested reorder: ${suggested} units.\nEnter quantity to add:`,
      suggested
    );

    if (amount && !isNaN(amount) && Number(amount) > 0) {
      try {
        const res = await API.put(`/products/${product._id}/stock`, {
          restockAmount: Number(amount),
        });
        if (res.data.success) {
          setSuccess(`Restocked ${amount} units for ${product.name}!`);
          fetchData();
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to restock');
      }
    }
  };

  if (loading) {
    return <Loader message="Loading your catalog..." />;
  }

  return (
    <div className="main-content">
      <div className="app-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Vendor Product Catalog</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Manage products, set minimum/maximum stock thresholds, and track health statuses.
            </p>
          </div>

          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} /> Add New Product
          </button>
        </div>

        {success && <div className="alert-box alert-box-success">{success}</div>}

        {/* Products Table */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Current Stock</th>
                <th>Min / Max Threshold</th>
                <th>Inventory Health</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No products added yet. Click "+ Add New Product" to list your first item.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={p.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200'}
                          alt={p.name}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                      </div>
                    </td>
                    <td>{p.category?.name || 'General'}</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(p.price)}</td>
                    <td>
                      <strong style={{ color: p.quantity <= p.minimumStock ? '#b45309' : 'inherit' }}>
                        {p.quantity} units
                      </strong>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--secondary)' }}>
                      Min: <strong>{p.minimumStock}</strong> | Max: <strong>{p.maximumStock}</strong>
                    </td>
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
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleQuickRestock(p)}
                          className="btn btn-secondary btn-sm"
                          title="Restock units"
                        >
                          <RefreshCw size={13} /> Restock
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Product"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)' }}
                          title="Delete Product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Product Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {error && <div className="alert-box alert-box-danger">{error}</div>}

              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    required
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Stock Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="form-input"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Stock Thresholds for Intelligent Engine */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Minimum Stock Alert Threshold</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-input"
                      value={formData.minimumStock}
                      onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Maximum Stock Capacity</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-input"
                      value={formData.maximumStock}
                      onChange={(e) => setFormData({ ...formData, maximumStock: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active (Visible in Marketplace)</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn btn-primary w-full"
                  style={{ padding: '12px', marginTop: '12px' }}
                >
                  {formLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProducts;
