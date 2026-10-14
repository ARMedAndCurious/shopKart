import mongoose from "mongoose";
import Order from "../modles/order.model.js";
import User from "../modles/user.modle.js";
import Product from "../modles/product.model.js";
import crypto from 'crypto'
import razorpay from "../config/razorpay.js";


export const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { shippingAddress } = req.body;

    // 1. Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName?.trim() ||
      !shippingAddress.phone?.trim() ||
      !shippingAddress.addressLine1?.trim() ||
      !shippingAddress.city?.trim() ||
      !shippingAddress.state?.trim() ||
      !shippingAddress.pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'All shipping address fields are required'
      });
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Pincode must contain 6 digits'
      });
    }

    // 2. Fetch user cart
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart cannot be empty' });
    }

    // 3. Final Stock Check & Server-Side Dynamic Total Calculation
    let totalAmount = 0;
    const orderItems = [];

    for (const item of user.cart) {
      const productId = (item.product?._id || item.product)?.toString();
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'One or more products in your cart no longer exist'
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available.`
        });
      }

      totalAmount += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    // 4. Create pending ShopKart order record first
    const shopKartOrder = new Order({
      user: userId,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim()
      },
      totalAmount,
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING'
    });

    await shopKartOrder.save();

    // 5. Create Razorpay order (amount in paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: shopKartOrder._id.toString()
    });

    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    // Notice: Cart is NOT cleared here

    // 6. Return safe checkout payload
    return res.status(201).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("🔴 CREATE PAYMENT ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// ---------------------------------------------------------------------------
// Step 11 & 12: POST /orders/verify-payment
// ---------------------------------------------------------------------------
export const verifyPayment = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing verification parameters'
      });
    }

    const order = await Order.findOne({ _id: shopKartOrderId, user: userId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Security Rule: Use the Razorpay Order ID stored in MongoDB as the trusted source
    const body = `${order.razorpayOrderId}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = 'FAILED';
      await order.save();
      // Cart is NOT cleared on failure
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Signature verified: update order
    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Decrement product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear user cart only after verified payment
    const user = await User.findById(userId);
    if (user) {
      user.cart = [];
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order placed successfully',
      order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// ---------------------------------------------------------------------------
// Step 15 / Bonus: Update Order Status (PLACED -> CONFIRMED -> SHIPPED -> DELIVERED)
// ---------------------------------------------------------------------------
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// ---------------------------------------------------------------------------
// GET /orders & GET /orders/:id
// ---------------------------------------------------------------------------
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};