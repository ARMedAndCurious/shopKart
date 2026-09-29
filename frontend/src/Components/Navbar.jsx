// src/Components/Navbar.jsx
import { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/authContext';
import { axiosInstance } from '../axiosCalls/axios';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth() || {};

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/users/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      if (setUser) {
        setUser(null);
      }
      navigate('/login');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black tracking-tight text-indigo-600">
          shopKart<span className="text-gray-900">.</span>
        </Link>

        <nav className="flex items-center gap-5">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium transition ${
                isActive ? 'text-indigo-600 font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            Home
          </NavLink>

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

          {/* Authenticated-only navigation items */}
          {user ? (
            <>
              <NavLink
                to="/create-product"
                className="text-sm font-medium bg-gray-900 text-white px-3.5 py-1.5 rounded-lg hover:bg-indigo-600 transition"
              >
                + Add Product
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition"
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