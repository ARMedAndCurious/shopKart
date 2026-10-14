// src/Context/cartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '../axiosCalls/axios';
import { useAuth} from './authContext';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth() || {};

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  



  // 1. Fetch / Refresh Cart from Backend
  const refreshCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/cart');
      setCartItems(res.data.cart || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Sync cart automatically when user signs in or out
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCartItems([]);
    }
  }, [user, refreshCart]);

  // 2. Add To Cart
  const addToCart = async (productId) => {
    setError(null);
    try {
      const res = await axiosInstance.post(`/cart/${productId}`);
      // Backend returns the updated populated cart
      if (res.data.cart) {
        setCartItems(res.data.cart);
      }
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // 3. Update Cart Quantity
  const updateQuantity = async (productId, quantity) => {
    setError(null);
    try {
      const res = await axiosInstance.patch(`/cart/${productId}`, { quantity });
      if (res.data.cart) {
        setCartItems(res.data.cart);
      }
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // 4. Remove From Cart
  const removeFromCart = async (productId) => {
    setError(null);
    try {
      const res = await axiosInstance.delete(`/cart/${productId}`);
      if (res.data.cart) {
        setCartItems(res.data.cart);
      }
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove product from cart';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Derived Values: Total unique units or item count
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);

  // Derived Values: Total subtotal calculation
  const cartTotal = cartItems.reduce((acc, item) => {
  const price = Number(item.product?.price) || 0;
  const quantity = Number(item.quantity) || 0;
  return acc + price * quantity;
}, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,

      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook for simple consumption in components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};