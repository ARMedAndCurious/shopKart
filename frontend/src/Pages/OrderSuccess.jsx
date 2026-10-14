// src/Pages/OrderSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { axiosInstance } from '../axiosCalls/axios';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/orders/${id}`);
        if (res.data?.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">Retrieving order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="text-xl font-bold text-gray-900">Order Not Found</h2>
        <p className="text-sm text-gray-500">{error || 'Unable to retrieve this order.'}</p>
        <Link
          to="/products"
          className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4 text-center">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
          ✓
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Placed Successfully</h1>
          <p className="text-sm text-gray-500 mt-1">Your order has been saved successfully.</p>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Order ID:</span>
            <span className="font-mono font-semibold text-gray-900">{order._id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total:</span>
            <span className="font-bold text-indigo-600">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Status:</span>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
              {order.status}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/orders"
            className="flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
          >
            View My Orders
          </Link>
          <Link
            to="/products"
            className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;