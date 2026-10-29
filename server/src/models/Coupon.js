import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: null },
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 500 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

couponSchema.methods.isValidForOrder = function (orderSubtotal) {
  if (!this.isActive) return { valid: false, reason: 'This coupon is inactive.' };
  const now = new Date();
  if (now < this.startDate) return { valid: false, reason: 'This coupon is not active yet.' };
  if (now > this.expiryDate) return { valid: false, reason: 'This coupon has expired.' };
  if (this.usedCount >= this.usageLimit) return { valid: false, reason: 'Coupon usage limit reached.' };
  if (orderSubtotal < this.minOrderAmount) {
    return {
      valid: false,
      reason: `Minimum order amount of ₹${this.minOrderAmount.toLocaleString()} required.`
    };
  }
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (orderSubtotal) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (orderSubtotal * this.value) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = Math.min(this.value, orderSubtotal);
  }
  return Math.round(discount);
};

export const Coupon = mongoose.model('Coupon', couponSchema);
