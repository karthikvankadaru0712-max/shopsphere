import mongoose from 'mongoose';

const inventoryMovementSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, default: '' },
    quantityChange: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: {
      type: String,
      enum: ['order_fulfillment', 'manual_adjustment', 'restock', 'return_restock', 'cancellation_restock', 'seed_initial'],
      required: true
    },
    actor: { type: String, default: 'system' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }
  },
  { timestamps: true }
);

inventoryMovementSchema.index({ product: 1, createdAt: -1 });

export const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);
