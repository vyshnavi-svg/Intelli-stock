import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Package,
  Layers,
  Users,
  Search,
  Sliders,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="app-container" style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <ShoppingBag size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              Intelli<span style={{ color: 'var(--primary)' }}>Stock</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '-2px' }}>
              Multi-Vendor Inventory
            </div>
          </div>
        </Link>

        {/* Search Bar (Customer marketplace search) */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            flex: 1,
            maxWidth: '460px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Search products, brands, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px', height: '40px', borderRadius: '20px' }}
          />
          <Search
            size={18}
            style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }}
          />
        </form>

        {/* Navigation Links based on role */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Public / Customer Links */}
          <Link
            to="/products"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Store size={16} /> Marketplace
          </Link>

          {/* Vendor Specific Navigation */}
          {user?.role === 'vendor' && (
            <>
              <Link
                to="/vendor/dashboard"
                style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link
                to="/vendor/inventory"
                style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Sliders size={16} /> Inventory Hub
              </Link>
              <Link
                to="/vendor/products"
                style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Package size={16} /> My Products
              </Link>
              <Link
                to="/vendor/orders"
                style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ShoppingBag size={16} /> Vendor Orders
              </Link>
            </>
          )}

          {/* Admin Specific Navigation */}
          {user?.role === 'admin' && (
            <>
              <Link
                to="/admin/dashboard"
                style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ShieldCheck size={16} /> Admin Portal
              </Link>
              <Link
                to="/admin/users"
                style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Users size={16} /> Users
              </Link>
              <Link
                to="/admin/orders"
                style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Package size={16} /> All Orders
              </Link>
            </>
          )}

          {/* Customer Orders link */}
          {user?.role === 'customer' && (
            <Link
              to="/orders"
              style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Package size={16} /> My Orders
            </Link>
          )}

          {/* Cart Icon (Customers & Guests) */}
          {(!user || user.role === 'customer') && (
            <Link
              to="/cart"
              style={{
                position: 'relative',
                padding: '8px',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Shopping Cart"
            >
              <ShoppingCart size={22} />
              {cart.itemCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cart.itemCount}
                </span>
              )}
            </Link>
          )}

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Account Controls */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f1f5f9',
                  border: '1px solid var(--border)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span>{user.name.split(' ')[0]}</span>
                <span className={`badge ${user.role === 'admin' ? 'badge-danger' : user.role === 'vendor' ? 'badge-info' : 'badge-primary'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {user.role}
                </span>
              </button>

              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '42px',
                    width: '200px',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    zIndex: 1000,
                  }}
                >
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      fontSize: '13px',
                      color: 'var(--text-main)',
                    }}
                  >
                    <User size={15} /> My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      fontSize: '13px',
                      color: 'var(--danger)',
                      background: 'none',
                      border: 'none',
                      borderTop: '1px solid var(--border)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
