import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon
} from '../controllers/cartController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(optionalAuth);

router.get('/', getCart);
router.post('/items', addToCart);
router.patch('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeCartItem);
router.post('/coupon', applyCoupon);
router.delete('/coupon', removeCoupon);

export default router;
