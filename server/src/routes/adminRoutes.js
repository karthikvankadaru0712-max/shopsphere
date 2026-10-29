import express from 'express';
import {
  getDashboardAnalytics,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getInventory,
  adjustStock,
  getAllCoupons,
  createCoupon,
  toggleCouponStatus,
  getAdminReviews,
  moderateReview,
  getAdminReturns,
  resolveReturn,
  getAuditLogs
} from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce admin authorization on all routes
router.use(authenticate, requireRole('admin'));

// Analytics
router.get('/analytics', getDashboardAnalytics);

// Product CRUD
router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

// Inventory
router.get('/inventory', getInventory);
router.post('/inventory/adjust', adjustStock);

// Coupons
router.get('/coupons', getAllCoupons);
router.post('/coupons', createCoupon);
router.patch('/coupons/:id/toggle', toggleCouponStatus);

// Reviews Moderation
router.get('/reviews', getAdminReviews);
router.patch('/reviews/:id/moderate', moderateReview);

// Return Processing
router.get('/returns', getAdminReturns);
router.patch('/returns/:id/resolve', resolveReturn);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

export default router;
