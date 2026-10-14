// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Context/authContext.jsx";
import { CartProvider } from "./Context/cartContext.jsx"; // 1. Must be imported

import SignUp from "./Pages/Signup";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import Products from "./Pages/Products";
import ProductDetails from "./Pages/ProductDetails";
import CreateProduct from "./Pages/CreateProduct";
import Wishlist from "./Pages/Wishlist";
import Cart from "./Pages/Cart"; // 2. Ensure Cart is imported
import Navbar from "./Components/Navbar";
import ProtectedRoutes from "./Components/ProtectedRoutes.jsx";
import PublicRoutes from "./Components/PublicRoutes.jsx";
import Checkout from "./Pages/Checkout.jsx";
import MyOrders from "./Pages/MyOrders.jsx";
import OrderSuccess from "./Pages/OrderSuccess.jsx";

export default function App() {
  return (
    <AuthProvider>
      {/* CartProvider MUST wrap BrowserRouter and Navbar */}
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
            <Navbar /> {/* <-- Now useCart() inside Navbar has access to CartProvider */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Routes>
                <Route path="/" element={<ProtectedRoutes><Home /></ProtectedRoutes>} />
                <Route path="/home" element={<ProtectedRoutes><Home /></ProtectedRoutes>} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/create-product" element={<ProtectedRoutes><CreateProduct /></ProtectedRoutes>} />
                <Route path="/wishlist" element={<ProtectedRoutes><Wishlist /></ProtectedRoutes>} />
                <Route path="/cart" element={<ProtectedRoutes><Cart /></ProtectedRoutes>} />
                <Route path="/register" element={<PublicRoutes><SignUp /></PublicRoutes>} />
                <Route path="/login" element={<PublicRoutes><Login /></PublicRoutes>} />
                <Route path="*" element={<Navigate to="/" replace />} />
                <Route path="/checkout" element={<ProtectedRoutes><Checkout /></ProtectedRoutes>} />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoutes>
                      <MyOrders/>
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoutes>
                      <OrderSuccess/>
                    </ProtectedRoutes>
                  }
                />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}