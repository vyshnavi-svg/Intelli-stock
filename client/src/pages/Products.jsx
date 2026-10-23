import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw, PackageSearch } from 'lucide-react';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState('newest');
  const [inStock, setInStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/admin/categories/public');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Update query params when URL changes
  useEffect(() => {
    if (searchParams.get('search') !== null) {
      setSearch(searchParams.get('search') || '');
    }
    if (searchParams.get('category') !== null) {
      setCategory(searchParams.get('category') || 'all');
    }
  }, [searchParams]);

  // Fetch products matching filters
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'all') params.append('category', category);
      if (sort) params.append('sort', sort);
      if (inStock) params.append('inStock', 'true');
      if (maxPrice) params.append('maxPrice', maxPrice);

      const res = await API.get(`/products?${params.toString()}`);
      if (res.data.success) {
        setProducts(res.data.products);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category, sort, inStock, maxPrice]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setSort('newest');
    setInStock(false);
    setMaxPrice('');
    setSearchParams({});
  };

  return (
    <div className="main-content">
      <div className="app-container">
        {/* Header banner */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Product Marketplace</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Discover multi-vendor products with real-time stock levels and automated inventory health status.
          </p>
        </div>

        {/* Filters and Controls Bar */}
        <div
          className="card"
          style={{
            padding: '20px',
            marginBottom: '30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              alignItems: 'center',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                className="form-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Sort by: Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <input
                type="number"
                className="form-input"
                placeholder="Max Price ($)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Quick Toggle & Reset */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border)',
              paddingTop: '14px',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              Show In-Stock Only (Stock &gt; 0)
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Showing <strong>{products.length}</strong> of <strong>{total}</strong> products
              </span>
              <button
                onClick={handleResetFilters}
                className="btn btn-secondary btn-sm"
              >
                <RotateCcw size={13} /> Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <Loader message="Filtering product catalog..." />
        ) : products.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <PackageSearch size={48} color="var(--text-muted)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No products matched your criteria</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Try adjusting your search keyword or clearing the active filters.
            </p>
            <button onClick={handleResetFilters} className="btn btn-primary btn-sm" style={{ marginTop: '10px' }}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
