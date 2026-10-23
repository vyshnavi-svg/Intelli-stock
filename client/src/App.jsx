import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public & Customer Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';

// Vendor Pages
import VendorDashboard from './pages/VendorDashboard';
import VendorProducts from './pages/VendorProducts';
import VendorOrders from './pages/VendorOrders';
import InventoryDashboard from './pages/InventoryDashboard';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageProducts from './pages/ManageProducts';
import ManageOrders from './pages/ManageOrders';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />

                {/* Customer Protected Routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Vendor Protected Routes */}
                <Route
                  path="/vendor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['vendor']}>
                      <VendorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/products"
                  element={
                    <ProtectedRoute allowedRoles={['vendor']}>
                      <VendorProducts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/orders"
                  element={
                    <ProtectedRoute allowedRoles={['vendor']}>
                      <VendorOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/inventory"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <InventoryDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageProducts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageOrders />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
