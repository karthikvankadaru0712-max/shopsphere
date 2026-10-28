import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const smartCollectionSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    visibility: { type: String, enum: ['private', 'public'], default: 'private' },
    shareCode: { type: String, unique: true, default: () => uuidv4().slice(0, 8) }
  },
  { timestamps: true }
);

smartCollectionSchema.index({ owner: 1, slug: 1 }, { unique: true });

export const SmartCollection = mongoose.model('SmartCollection', smartCollectionSchema);
