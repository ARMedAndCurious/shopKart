// src/Pages/Cart.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../Context/cartContext';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartCount,
    cartTotal,
    loading,
    error,
    updateQuantity,
    removeFromCart,
    refreshCart
  } = useCart();

  const [busyItem, setBusyItem] = useState(null);
  const [actionError, setActionError] = useState('');


  const handleQty = async (productId, nextQty, stock) => {
    if (!productId || nextQty < 1 || nextQty > stock || busyItem) return;
    setActionError('');
    setBusyItem(productId);

    try {
      const result = await updateQuantity(productId, nextQty);
      if (!result.success) {
        setActionError(result.message);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to update quantity');
    } finally {
      // Guaranteed to unlock even if an exception occurs
      setBusyItem(null);
    }
  };

  const handleRemove = async (productId) => {
    if (!productId || busyItem) return;
    setActionError('');
    setBusyItem(productId);

    try {
      const result = await removeFromCart(productId);
      if (!result.success) {
        setActionError(result.message);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to remove product');
    } finally {
      setBusyItem(null);
    }
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading your cart...</p>
      </div>
    );
  }

  if (error && cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-lg font-bold">
          !
        </div>
        <h2 className="text-xl font-bold text-gray-900">Unable to load your cart.</h2>
        <button
          onClick={refreshCart}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="text-5xl">🛒</div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty 🛒</h2>
          <p className="text-sm text-gray-500 mt-1">Looks like you haven't added anything yet.</p>
        </div>
        <Link
          to="/products"
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>
          <p className="text-sm text-gray-500">
            {cartCount} {cartCount === 1 ? 'item' : 'items'} in your bag
          </p>
        </div>
        <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          Continue shopping →
        </Link>
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-3">
          {cartItems.map((item) => {
            const product = item.product || {};
            // Safely extract string ID
            const productId = (product._id || item.product)?.toString();
            const isItemBusy = busyItem === productId;
            const stock = product.stock ?? 99;

            return (
              <div
                key={productId || Math.random()}
                className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between shadow-xs transition hover:border-gray-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-2 flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=Product';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-600 mt-0.5">
                      ₹{product.price?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Stock: {stock}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  {/* Stepper */}
                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                    <button
                      type="button"
                      disabled={item.quantity <= 1 || isItemBusy}
                      onClick={() => handleQty(productId, item.quantity - 1, stock)}
                      className="w-8 h-8 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-l-lg transition cursor-pointer"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-gray-900">
                      {isItemBusy ? '…' : item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={item.quantity >= stock || isItemBusy}
                      onClick={() => handleQty(productId, item.quantity + 1, stock)}
                      className="w-8 h-8 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-r-lg transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal & Delete */}
                  <div className="text-right min-w-[5rem]">
                    <div className="text-base font-bold text-gray-900">
                      ₹{((product.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </div>
                    <button
                      type="button"
                      disabled={isItemBusy}
                      onClick={() => handleRemove(productId)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 transition mt-1 cursor-pointer disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
            Order Summary
          </h2>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Total Units</span>
              <span className="font-semibold text-gray-900">{cartCount}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className="text-emerald-600 font-semibold">FREE</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span className="text-indigo-600">₹{cartTotal.toLocaleString('en-IN')}</span>
          </div>

          <Link
            to="/checkout"
            className="block text-center w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-xs cursor-pointer no-underline"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;