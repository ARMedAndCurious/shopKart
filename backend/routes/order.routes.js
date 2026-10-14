import express from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { createPaymentOrder, getMyOrders, getOrderById, updateOrderStatus, verifyPayment } from '../controllers/order.controller.js';

const orderRouter = express.Router();

// POST /orders
orderRouter.post('/create-payment-order', isAuthenticated, createPaymentOrder);
orderRouter.post('/verify-payment', isAuthenticated, verifyPayment)
orderRouter.patch('/:id/status', isAuthenticated, updateOrderStatus);
orderRouter.get('/', isAuthenticated, getMyOrders)
orderRouter.get('/:id', getOrderById)


export default orderRouter;