import mongoose from 'mongoose';

const priceAlertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    targetPrice: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
    lastTriggeredAt: { type: Date, default: null }
  },
  { timestamps: true }
);

priceAlertSchema.index({ product: 1, isActive: 1 });
priceAlertSchema.index({ user: 1, product: 1 }, { unique: true });

export const PriceAlert = mongoose.model('PriceAlert', priceAlertSchema);
