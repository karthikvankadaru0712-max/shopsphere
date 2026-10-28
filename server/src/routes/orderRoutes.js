import express from 'express';
import {
  getCheckoutQuote,
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  requestReturn,
  verifyRazorpayPayment
} from '../controllers/orderController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkout-quote', optionalAuth, getCheckoutQuote);
router.post('/', authenticate, createOrder);
router.get('/', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/:id/cancel', authenticate, cancelOrder);
router.post('/:id/return', authenticate, requestReturn);
router.post('/verify-payment', authenticate, verifyRazorpayPayment);

export default router;
