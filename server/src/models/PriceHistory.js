import mongoose from 'mongoose';

const priceHistorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, default: null },
    currency: { type: String, default: 'INR' },
    recordedAt: { type: Date, default: Date.now },
    reason: { type: String, default: 'Price Adjustment' },
    isDemo: { type: Boolean, default: false }
  },
  { timestamps: true }
);

priceHistorySchema.index({ product: 1, recordedAt: 1 });

export const PriceHistory = mongoose.model('PriceHistory', priceHistorySchema);
