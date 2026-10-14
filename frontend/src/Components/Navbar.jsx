// src/Components/Navbar.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/authContext.jsx';
import { useCart } from '../Context/cartContext.jsx';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black tracking-tight text-indigo-600">
          shopKart<span className="text-gray-900">.</span>
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `text-sm font-medium transition ${
                isActive ? 'text-indigo-600 font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            Products
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/wishlist"
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? 'text-indigo-600 font-semibold' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                Wishlist
              </NavLink>

              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive ? 'text-indigo-600 font-semibold' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                Cart
                {cartCount > 0 && (
                  <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/create-product"
                className="text-sm font-medium bg-gray-900 text-white px-3.5 py-1.5 rounded-lg hover:bg-indigo-600 transition"
              >
                + Add Product
              </NavLink>

              <NavLink
                to="/orders"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
              >
                My Orders
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
            >
              Login
            </NavLink>
            
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;