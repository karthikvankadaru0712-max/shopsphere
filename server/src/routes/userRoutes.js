import express from 'express';
import {
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getNotifications,
  markNotificationAsRead,
  subscribeNewsletter
} from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/newsletter', subscribeNewsletter);

router.use(authenticate);

router.patch('/profile', updateProfile);
router.post('/addresses', addAddress);
router.patch('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationAsRead);

export default router;
