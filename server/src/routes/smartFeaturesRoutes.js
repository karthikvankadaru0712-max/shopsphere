import express from 'express';
import {
  getSmartCartAnalysis,
  calculateMatchScore,
  getVibeFindCurations,
  getGiftFinderRecommendations,
  createPriceAlert,
  getMyPriceAlerts,
  deletePriceAlert,
  getOwnershipHubProducts
} from '../controllers/smartFeaturesController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/smart-cart', optionalAuth, getSmartCartAnalysis);
router.post('/match-score', calculateMatchScore);
router.get('/vibefind', getVibeFindCurations);
router.post('/gift-finder', getGiftFinderRecommendations);
router.post('/price-alerts', authenticate, createPriceAlert);
router.get('/price-alerts', authenticate, getMyPriceAlerts);
router.delete('/price-alerts/:id', authenticate, deletePriceAlert);
router.get('/ownership-hub', authenticate, getOwnershipHubProducts);

export default router;
