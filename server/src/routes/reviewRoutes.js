import express from 'express';
import { voteHelpful, reportReview } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:id/helpful', authenticate, voteHelpful);
router.post('/:id/report', reportReview);

export default router;
