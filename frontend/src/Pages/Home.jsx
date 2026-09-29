// src/Pages/Home.jsx
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth} from '../Context/authContext';
import {axiosInstance as api} from '../axiosCalls/axios';

const Home = () => {
  const navigate = useNavigate();
  // Grab logout or user context if exposed by your AuthContext
  const auth = useAuth();

  

  return (
    <div className="space-y-16 py-8">
      {/* Top Bar with User Info & Logout Button */}
      <div className="flex justify-between items-center max-w-5xl mx-auto px-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Welcome back{auth?.user?.name ? `, ${auth.user.name}` : ''}!
          </h2>
          <p className="text-xs text-gray-500">Manage your account or browse items</p>
        </div>
        
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-gray-50 border border-gray-200 rounded-3xl p-8 sm:p-14 text-center max-w-5xl mx-auto">
        <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase bg-indigo-100/60 px-3 py-1 rounded-full">
          Modern Marketplace
        </span>
        <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          Everything you need, delivered simple.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
          Explore top-grade electronics, fashion essentials, books, and lifestyle items curated for your everyday needs.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/products"
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            Explore Catalog
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="p-6 bg-white border border-gray-200 rounded-2xl">
          <h3 className="text-base font-bold text-gray-900">Curated Quality</h3>
          <p className="mt-2 text-sm text-gray-600">
            Hand-picked items meeting top industry standards with guaranteed durability.
          </p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-2xl">
          <h3 className="text-base font-bold text-gray-900">Fast Shipping</h3>
          <p className="mt-2 text-sm text-gray-600">
            Rapid and safe delivery right to your doorstep with end-to-end tracking.
          </p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-2xl">
          <h3 className="text-base font-bold text-gray-900">Dedicated Support</h3>
          <p className="mt-2 text-sm text-gray-600">
            24/7 customer care ready to assist with order management and inquiries.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;