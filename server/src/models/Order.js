import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
  selectedAttributes: { type: Map, of: String },
  sku: { type: String }
}, { _id: true });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
  note: { type: String, default: '' },
  actor: { type: String, default: 'system' }
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    deliveryAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' }
    },
    shippingMethod: { type: String, default: 'Standard Tracked Delivery' },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paymentMethod: { type: String, enum: ['cod', 'mock', 'razorpay'], default: 'mock' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'authorized', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    fulfillmentStatus: {
      type: String,
      enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'processing'
    },
    statusHistory: [statusHistorySchema],
    couponSnapshot: {
      code: { type: String },
      discountAmount: { type: Number, default: 0 },
      discountType: { type: String }
    },
    paymentReference: { type: String, default: null },
    cancellationReason: { type: String, default: null },
    cancelledAt: { type: Date, default: null }
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ fulfillmentStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

export const Order = mongoose.model('Order', orderSchema);
