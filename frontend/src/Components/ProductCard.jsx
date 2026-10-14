// src/Components/ProductCard.jsx
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/authContext';
import { useCart } from '../Context/cartContext';
import { axiosInstance } from '../axiosCalls/axios';

const ProductCard = ({ product, initialIsWishlisted = false }) => {
  const { _id, name, price, category, image, stock } = product;
  const { user } = useContext(AuthContext) || {};
  const { cartItems, addToCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cardError, setCardError] = useState('');

  // Find if this product is already in the cart
  const cartItem = cartItems?.find(
    (item) => (item.product?._id || item.product) === _id
  );

  const handleWishlistToggle = async () => {
    if (wishlistLoading) return;
    if (!user) return navigate('/login');

    setCardError('');
    setWishlistLoading(true);
    try {
      if (!isWishlisted) {
        await axiosInstance.post(`/wishlist/${_id}`);
        setIsWishlisted(true);
      } else {
        await axiosInstance.delete(`/wishlist/${_id}`);
        setIsWishlisted(false);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setIsWishlisted(true);
      } else {
        setCardError(err.response?.data?.message || 'Wishlist error');
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAdd = async () => {
    if (cartLoading) return;
    if (!user) return navigate('/login');

    setCardError('');
    setCartLoading(true);
    const res = await addToCart(_id);
    if (!res.success) setCardError(res.message);
    setCartLoading(false);
  };

  const handleStepQty = async (delta) => {
    if (!cartItem || cartLoading) return;
    const next = cartItem.quantity + delta;
    if (next < 1 || next > stock) return;

    setCartLoading(true);
    const res = await updateQuantity(_id, next);
    if (!res.success) setCardError(res.message);
    setCartLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group">
      <div>
        {/* Product Image */}
        <div className="h-48 w-full bg-gray-50 flex items-center justify-center p-3 relative border-b border-gray-100 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300?text=No+Image';
            }}
          />

          {/* Quick Wishlist Floating Icon */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-xs rounded-full flex items-center justify-center text-sm shadow-xs border border-gray-100 hover:scale-110 transition cursor-pointer"
          >
            {isWishlisted ? (
              <span className="text-rose-500 font-bold">♥</span>
            ) : (
              <span className="text-gray-400 hover:text-gray-600">♡</span>
            )}
          </button>
        </div>

        {/* Product Meta */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
            {category}
          </span>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{name}</h3>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-base font-bold text-gray-900">
              ₹{price?.toLocaleString('en-IN')}
            </span>
            <span
              className={`text-[11px] font-semibold ${
                stock > 0 ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              {stock > 0 ? `${stock} in stock` : 'Out of stock'}
            </span>
          </div>
          {cardError && <p className="text-xs text-red-500 pt-1">{cardError}</p>}
        </div>
      </div>

      {/* Cart & Details Actions */}
      <div className="p-4 pt-0 space-y-2">
        {/* Dynamic Cart Control */}
        {cartItem ? (
          <div className="flex items-center justify-between border border-indigo-200 bg-indigo-50/50 rounded-lg p-1">
            <button
              type="button"
              disabled={cartItem.quantity <= 1 || cartLoading}
              onClick={() => handleStepQty(-1)}
              className="w-7 h-7 flex items-center justify-center font-bold text-indigo-700 bg-white rounded shadow-xs hover:bg-gray-50 disabled:opacity-40 transition"
            >
              −
            </button>
            <span className="text-xs font-bold text-indigo-900">
              {cartLoading ? '…' : `${cartItem.quantity} in bag`}
            </span>
            <button
              type="button"
              disabled={cartItem.quantity >= stock || cartLoading}
              onClick={() => handleStepQty(1)}
              className="w-7 h-7 flex items-center justify-center font-bold text-indigo-700 bg-white rounded shadow-xs hover:bg-gray-50 disabled:opacity-40 transition"
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            disabled={cartLoading || stock <= 0}
            className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-40 cursor-pointer"
          >
            {cartLoading ? 'Adding...' : stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        )}

        <Link
          to={`/products/${_id}`}
          className="block w-full text-center py-1.5 px-3 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;