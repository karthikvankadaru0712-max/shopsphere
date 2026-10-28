import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    icon: { type: String, default: 'Tag' },
    active: { type: Boolean, default: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }
  },
  { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);
