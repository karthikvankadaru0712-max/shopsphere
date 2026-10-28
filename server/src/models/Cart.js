import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  selectedAttributes: {
    color: { type: String },
    size: { type: String },
    storage: { type: String }
  }
}, { _id: true });

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    guestId: { type: String, default: null },
    items: [cartItemSchema],
    appliedCoupon: {
      code: { type: String },
      discountAmount: { type: Number, default: 0 },
      discountType: { type: String }
    }
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 }, { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } });
cartSchema.index({ guestId: 1 }, { partialFilterExpression: { guestId: { $type: 'string' } } });

export const Cart = mongoose.model('Cart', cartSchema);
