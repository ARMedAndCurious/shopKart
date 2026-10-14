// src/Pages/Checkout.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../Context/cartContext';
import { axiosInstance } from '../axiosCalls/axios';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Avoid appending multiple times
    if (document.getElementById('razorpay-checkout-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, loading, refreshCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState({ text: '', type: '' });

  const validateField = (name, value) => {
    const trimmed = value.trim();
    switch (name) {
      case 'fullName':
        return !trimmed ? 'Full Name is required.' : '';
      case 'phone':
        if (!trimmed) return 'Phone number is required.';
        if (!/^(?:\+91|0)?[6-9]\d{9}$/.test(trimmed)) {
          return 'Enter a valid 10-digit mobile number.';
        }
        return '';
      case 'addressLine1':
        return !trimmed ? 'Address is required.' : '';
      case 'city':
        return !trimmed ? 'City is required.' : '';
      case 'state':
        return !trimmed ? 'State is required.' : '';
      case 'pincode':
        if (!trimmed) return 'Pincode is required.';
        if (!/^\d{6}$/.test(trimmed)) return 'Pincode must contain 6 digits.';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(shippingAddress).forEach((key) => {
      const msg = validateField(key, shippingAddress[key]);
      if (msg) newErrors[key] = msg;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaymentNotice({ text: '', type: '' });

    if (!validateAll()) return;

    if (!cartItems || cartItems.length === 0) {
      setPaymentNotice({ text: 'Your cart is empty.', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Ensure Razorpay script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setPaymentNotice({
          text: 'Failed to load Razorpay SDK. Check your internet connection.',
          type: 'error'
        });
        setIsSubmitting(false);
        return;
      }

      // 2. Request backend to create Razorpay Order
      const sanitizedAddress = {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim()
      };

      const res = await axiosInstance.post('/orders/create-payment-order', {
        shippingAddress: sanitizedAddress
      });

      const data = res.data;

      // 3. Configure Razorpay Standard Modal
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'ShopKart',
        description: 'Order Payment',
        order_id: data.razorpayOrderId,

        handler: async function (response) {
          try {
            setPaymentNotice({ text: 'Verifying payment with server...', type: 'info' });

            // Step 11: Backend Verification API
            const verifyRes = await axiosInstance.post('/orders/verify-payment', {
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              // Clear frontend global cart immediately
              if (refreshCart) await refreshCart();
              navigate(`/orders/${data.shopKartOrderId}`);
            }
          } catch (verifyErr) {
            setPaymentNotice({
              text: verifyErr.response?.data?.message || 'Payment signature verification failed.',
              type: 'error'
            });
            setIsSubmitting(false);
          }
        },

        prefill: {
          name: sanitizedAddress.fullName,
          contact: sanitizedAddress.phone
        },

        theme: {
          color: '#4f46e5'
        },

        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);

      // Step 15: Handle payment failure
      paymentObject.on('payment.failed', function (failResponse) {
        setPaymentNotice({
          text: `Payment failed: ${failResponse.error?.description || 'Your cart has not been cleared. Please try again.'}`,
          type: 'error'
        });
        setIsSubmitting(false);
      });

      paymentObject.open();
    } catch (err) {
      setPaymentNotice({
        text: err.response?.data?.message || 'Failed to initiate checkout',
        type: 'error'
      });
      setIsSubmitting(false);
    }
  };

  if (!loading && (!cartItems || cartItems.length === 0)) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <Link
          to="/products"
          className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Checkout</h1>
        <p className="text-sm text-gray-500">Provide shipping details and pay with Razorpay</p>
      </div>

      {paymentNotice.text && (
        <div
          className={`p-3.5 rounded-lg text-sm font-medium border ${
            paymentNotice.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}
        >
          {paymentNotice.text}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shipping Form */}
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              Shipping Details
            </h2>

            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={shippingAddress.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Aarav Sharma"
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.fullName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'
                }`}
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={shippingAddress.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="10-digit mobile number"
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'
                }`}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="addressLine1" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Address Line *
              </label>
              <input
                id="addressLine1"
                name="addressLine1"
                type="text"
                value={shippingAddress.addressLine1}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="House / Street address"
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.addressLine1 ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'
                }`}
              />
              {errors.addressLine1 && <p className="text-xs text-red-500 mt-1">{errors.addressLine1}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="city" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  City *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={shippingAddress.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.city ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'
                  }`}
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="state" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  State *
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={shippingAddress.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.state ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'
                  }`}
                />
                {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
              </div>

              <div>
                <label htmlFor="pincode" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Pincode *
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  maxLength={6}
                  value={shippingAddress.pincode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="6 digits"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.pincode ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'
                  }`}
                />
                {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
              </div>
            </div>
          </div>

          {/* Order Summary & Trigger */}
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              Order Summary
            </h2>

            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {cartItems.map((item) => {
                const product = item.product || {};
                const name = product.name || 'Product';
                const price = Number(product.price) || 0;
                const qty = Number(item.quantity) || 1;
                const id = (product._id || item.product)?.toString();

                return (
                  <div key={id} className="py-2 flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">
                      {name} <span className="text-gray-400">× {qty}</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      ₹{(price * qty).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span>
                <span className="text-indigo-600">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Opening Razorpay...' : 'Pay with Razorpay'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;