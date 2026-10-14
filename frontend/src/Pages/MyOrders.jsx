// src/Pages/MyOrders.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../axiosCalls/axios';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await axiosInstance.get('/orders');
            if (res.data?.success) {
                setOrders(res.data.orders || []);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    // Helper inside MyOrders.jsx
    const getStatusBadge = (status) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'SHIPPED':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'CONFIRMED':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'PLACED':
                return 'bg-amber-100 text-amber-800 border-amber-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
                <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-gray-500">Loading your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">
                    !
                </div>
                <h2 className="text-xl font-bold text-gray-900">Failed to Load Orders</h2>
                <p className="text-sm text-gray-500">{error}</p>
                <button
                    onClick={fetchOrders}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
                <div className="text-5xl">📦</div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
                    <p className="text-sm text-gray-500 mt-1">You have not placed any orders yet.</p>
                </div>
                <Link
                    to="/products"
                    className="inline-block px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Orders</h1>
                <p className="text-sm text-gray-500">View and track all your past purchases</p>
            </div>

            <div className="space-y-4">
                {orders.map((order) => {
                    const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    });

                    return (
                        <div
                            key={order._id}
                            className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-gray-300 transition space-y-4"
                        >
                            <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 gap-2">
                                <div>
                                    <h3 className="font-mono text-sm font-bold text-gray-900">
                                        Order #{order._id}
                                    </h3>
                                    <p className="text-xs text-gray-500">{dateStr}</p>
                                </div>
                                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusBadge(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Order Items Snapshot */}
                            <div className="divide-y divide-gray-50">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="py-2 flex justify-between text-sm">
                                        <span className="text-gray-700">
                                            {item.name} <span className="text-gray-400">× {item.quantity}</span>
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                <div className="text-sm">
                                    <span className="text-gray-500">Total: </span>
                                    <span className="font-bold text-gray-900 text-base">
                                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <Link
                                    to={`/orders/${order._id}`}
                                    className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyOrders;