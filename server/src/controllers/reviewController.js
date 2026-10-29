import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { HelpfulVote } from '../models/HelpfulVote.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

// Recalculates product rating summary dynamically
const updateProductRatingSummary = async (productId) => {
  const reviews = await Review.find({ product: productId, status: 'approved' });
  const count = reviews.length;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRating = 0;

  for (const r of reviews) {
    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    totalRating += r.rating;
  }

  const average = count > 0 ? parseFloat((totalRating / count).toFixed(1)) : 0;

  await Product.findByIdAndUpdate(productId, {
    ratingSummary: { average, count, distribution }
  });
};

export const getProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sort = 'newest', page = 1, limit = 10 } = req.query;

    let sortQuery = { createdAt: -1 };
    if (sort === 'highest') sortQuery = { rating: -1, createdAt: -1 };
    else if (sort === 'lowest') sortQuery = { rating: 1, createdAt: -1 };
    else if (sort === 'helpful') sortQuery = { helpfulCount: -1, createdAt: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [reviews, totalCount] = await Promise.all([
      Review.find({ product: id, status: 'approved' })
        .populate('user', 'name avatar')
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments({ product: id, status: 'approved' })
    ]);

    return successResponse(res, 200, 'Reviews retrieved', {
      reviews,
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum) || 1
    });
  } catch (err) {
    next(err);
  }
};

export const createProductReview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params; // Product ID
    const { rating, title, body } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    // Check if user already reviewed this product
    const existing = await Review.findOne({ user: userId, product: id });
    if (existing) {
      return errorResponse(res, 400, 'You have already submitted a review for this product');
    }

    // Check if verified purchase
    const eligibleOrder = await Order.findOne({
      customer: userId,
      'items.product': id,
      paymentStatus: 'paid'
    });

    const isVerifiedPurchase = !!eligibleOrder;

    const review = await Review.create({
      user: userId,
      product: id,
      order: eligibleOrder?._id || null,
      rating: Number(rating),
      title: title.trim(),
      body: body.trim(),
      isVerifiedPurchase,
      status: 'approved'
    });

    await updateProductRatingSummary(id);

    return successResponse(res, 201, 'Review submitted successfully', { review });
  } catch (err) {
    next(err);
  }
};

export const voteHelpful = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params; // Review ID

    const review = await Review.findById(id);
    if (!review) {
      return errorResponse(res, 404, 'Review not found');
    }

    const existingVote = await HelpfulVote.findOne({ review: id, user: userId });
    if (existingVote) {
      return errorResponse(res, 400, 'You have already marked this review as helpful.');
    }

    await HelpfulVote.create({ review: id, user: userId });
    review.helpfulCount += 1;
    await review.save();

    return successResponse(res, 200, 'Helpful vote recorded', { helpfulCount: review.helpfulCount });
  } catch (err) {
    next(err);
  }
};

export const reportReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return errorResponse(res, 404, 'Review not found');
    }

    review.reportCount += 1;
    if (review.reportCount >= 3) {
      review.status = 'pending'; // moves to moderation
    }
    await review.save();

    return successResponse(res, 200, 'Review reported for moderation review.');
  } catch (err) {
    next(err);
  }
};
