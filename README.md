# 🛒 ShopKart — Full-Stack E-Commerce & Order Management Engine

A full-stack MERN e-commerce application featuring real-time cart synchronization, defensive inventory and server-side pricing validation, historical order snapshot persistence, and end-to-end Razorpay payment gateway integration with cryptographic signature verification.

---

## 🚀 Key Highlights & Architecture

- **Server-Side Dynamic Pricing:** Frontend totals and prices are strictly untrusted. The backend recalculates order totals dynamically from database product models at checkout.
- **Stock Guardrails & Double-Check:** Inventory is re-verified right before payment order generation to prevent race conditions and overselling.
- **Historical Order Snapshots:** Purchases snapshot product details (name, price at purchase, images) into dedicated subdocuments so future catalog edits or price updates never alter past receipts.
- **Cryptographic Payment Verification:** Razorpay orders are verified server-side using HMAC SHA-256 signatures via Node's native `crypto` module.
- **Defensive Cart Lifecycle:** User carts remain untouched during pending payment states and are only cleared once a valid payment signature is verified.
- **Order Progression Tracking:** Orders support complete lifecycle status tracking (`PLACED` ➔ `CONFIRMED` ➔ `SHIPPED` ➔ `DELIVERED`).

---

## 🛠️ Tech Stack

- **Frontend:** React 18, React Router v6, Tailwind CSS, Axios, Lucide Icons
- **Backend:** Node.js, Express.js, Mongoose (MongoDB ODM)
- **Payment Gateway:** Razorpay Standard Checkout SDK
- **Security & Auth:** JWT-based stateless session authentication, HMAC SHA-256 signatures

---

## 📦 Features Breakdown

### 1. Cart & State Management
- Reactive cart state powered by `CartContext` with derived unit counts and subtotal amounts.
- Stepper controls (`+` / `−`) with live stock limits and optimistic local fallback.
- Defensive ID comparisons handling both populated documents and raw MongoDB `ObjectId` strings.

### 2. Checkout & Defensive Validation
- Shipping address collection: Full Name, 10-digit Phone, Address Line, City, State, and 6-digit PIN code.
- Immediate client-side validation to eliminate redundant network traffic on whitespace-only or malformed inputs.
- Secondary server-side input sanitation.

### 3. Order Management & Payment Flow
- **Step 1:** Client submits shipping info to `POST /orders/create-payment-order`.
- **Step 2:** Backend verifies real-time stock, calculates totals, creates a pending `Order` record, and issues a Razorpay Order ID.
- **Step 3:** Razorpay modal launches on client.
- **Step 4:** On payment success, client sends payment details to `POST /orders/verify-payment`.
- **Step 5:** Backend validates HMAC SHA-256 signature, updates order to `PAID` / `PLACED`, decrements inventory, and empties the user's cart.

### 4. Orders Dashboard & Order Details
- **My Orders (`/orders`):** Lists past orders sorted newest-first, rendering itemized breakdowns, total spent, date formatting (`en-IN`), and visual status badges.
- **Order Confirmation / Details (`/orders/:id`):** Displays purchase receipt, order ID, and status summary protected by strict user ownership checks.

---

## 📂 Project Structure

```text
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── razorpay.js
│   ├── controllers/
│   │   ├── cart.controller.js
│   │   └── order.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── order.model.js
│   │   ├── product.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── cart.routes.js
│   │   └── order.routes.js
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── axiosCalls/
    │   │   └── axios.js
    │   ├── Components/
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoutes.jsx
    │   ├── Context/
    │   │   ├── authContext.jsx
    │   │   └── cartContext.jsx
    │   ├── Pages/
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── MyOrders.jsx
    │   │   ├── OrderSuccess.jsx
    │   │   └── Products.jsx
    │   ├── App.jsx
    │   └── main.jsx
