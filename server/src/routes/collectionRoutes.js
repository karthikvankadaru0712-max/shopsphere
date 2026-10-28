import express from 'express';
import {
  getMyCollections,
  createCollection,
  getCollectionBySlugOrCode,
  addProductToCollection,
  removeProductFromCollection,
  deleteCollection
} from '../controllers/collectionController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', authenticate, getMyCollections);
router.post('/', authenticate, createCollection);
router.get('/:identifier', optionalAuth, getCollectionBySlugOrCode);
router.post('/:id/products', authenticate, addProductToCollection);
router.delete('/:id/products/:productId', authenticate, removeProductFromCollection);
router.delete('/:id', authenticate, deleteCollection);

export default router;
