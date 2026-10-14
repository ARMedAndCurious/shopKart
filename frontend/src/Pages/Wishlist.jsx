// src/Pages/Wishlist.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../axiosCalls/axios';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/wishlist');
      setWishlist(response.data.wishlist || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    if (removingId) return;

    setRemovingId(productId);
    try {
      await axiosInstance.delete(`/wishlist/${productId}`);
      // Remove product directly from UI state without page reload
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove product from wishlist');
    } finally {
      setRemovingId(null);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-base font-medium text-gray-600 animate-pulse">
          Loading your wishlist...
        </p>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold">
          !
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">Unable to load wishlist.</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            Please check your connection or try again in a few moments.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchWishlist}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // 3. Empty State
  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-2xl">
          ❤️
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Your wishlist is empty ❤️</h2>
          <p className="text-sm text-gray-500">Start saving products you love.</p>
        </div>
        <Link
          to="/products"
          className="inline-block px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  // 4. Populated Wishlist Grid
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-sm text-gray-500 mt-1">
            {wishlist.length} {wishlist.length === 1 ? 'saved product' : 'saved products'}
          </p>
        </div>
        <Link
          to="/products"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Continue Shopping →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div
            key={product._id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="h-52 w-full bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                  }}
                />
              </div>

              <div className="p-4 space-y-1.5">
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                  {product.category}
                </span>
                <h3 className="font-semibold text-gray-900 text-base line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-gray-900">
                  ₹{product.price?.toLocaleString('en-IN')}
                </p>
                <p
                  className={`text-xs font-medium ${
                    product.stock > 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 space-y-2">
              <Link
                to={`/products/${product._id}`}
                className="block w-full text-center py-2 px-4 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition"
              >
                View Details
              </Link>

              <button
                type="button"
                onClick={() => handleRemove(product._id)}
                disabled={removingId === product._id}
                className="w-full py-2 px-4 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition disabled:opacity-50 cursor-pointer"
              >
                {removingId === product._id ? 'Removing...' : 'Remove from Wishlist'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;