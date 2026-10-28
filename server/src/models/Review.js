import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    isVerifiedPurchase: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
    status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
    reportCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
