import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getSearchSuggestions,
  getRelatedProducts,
  getProductPriceHistory,
  getHomeCatalogSections
} from '../controllers/productController.js';
import { getProductReviews, createProductReview } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/home-sections', getHomeCatalogSections);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/:slug', getProductBySlug);
router.get('/:id/related', getRelatedProducts);
router.get('/:id/price-history', getProductPriceHistory);
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', authenticate, createProductReview);

export default router;
