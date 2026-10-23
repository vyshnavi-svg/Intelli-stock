import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (isAuthenticated && user?.role === 'customer') {
      try {
        setLoading(true);
        const res = await API.get('/cart');
        if (res.data.success) {
          setCart(res.data.cart);
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setCart({ items: [], itemCount: 0, subtotal: 0, tax: 0, shipping: 0, total: 0 });
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user?.role]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please login to add items to cart' };
    }
    if (user?.role !== 'customer') {
      return { success: false, message: 'Only customer accounts can purchase items' };
    }

    try {
      const res = await API.post('/cart/add', { productId, quantity });
      if (res.data.success) {
        setCart(res.data.cart);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add item to cart';
      return { success: false, message };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await API.put('/cart/update', { productId, quantity });
      if (res.data.success) {
        setCart(res.data.cart);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update quantity';
      return { success: false, message };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await API.delete(`/cart/remove/${productId}`);
      if (res.data.success) {
        setCart(res.data.cart);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove item';
      return { success: false, message };
    }
  };

  const clearCart = async () => {
    try {
      const res = await API.delete('/cart/clear');
      if (res.data.success) {
        setCart(res.data.cart);
        return { success: true };
      }
    } catch (err) {
      console.error('Failed to clear cart:', err);
      return { success: false };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
