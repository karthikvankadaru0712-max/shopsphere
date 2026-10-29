import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    provider: { type: String, enum: ['mock', 'razorpay', 'cod'], required: true },
    providerOrderId: { type: String, default: '' },
    paymentId: { type: String, default: '' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'captured', 'failed', 'refunded'],
      default: 'pending'
    },
    verificationMetadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ paymentId: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
