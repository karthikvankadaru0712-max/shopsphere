import mongoose from 'mongoose';

const returnRequestSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }
      }
    ],
    reason: {
      type: String,
      enum: ['defective', 'wrong_item', 'not_as_described', 'changed_mind', 'size_fit_issue'],
      required: true
    },
    comments: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending'
    },
    adminNotes: { type: String, default: '' },
    refundAmount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

returnRequestSchema.index({ order: 1 });
returnRequestSchema.index({ user: 1, createdAt: -1 });

export const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);
