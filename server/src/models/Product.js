import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  compareAtPrice: { type: Number },
  stock: { type: Number, required: true, default: 0 },
  attributes: {
    color: { type: String },
    size: { type: String },
    storage: { type: String },
  },
  image: { type: String }
}, { _id: true });

const specificationSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const productPassportSchema = new mongoose.Schema({
  origin: { type: String, default: 'India' },
  materials: { type: String, default: 'Eco-conscious & Recyclable' },
  warranty: { type: String, default: '1 Year Manufacturer Limited Warranty' },
  repairability: { type: Number, default: 8, min: 1, max: 10 },
  careInstructions: { type: String, default: 'Store in cool dry conditions. Clean with microfiber cloth.' },
  packaging: { type: String, default: '100% Recycled Kraft paper packaging' },
  manufacturer: { type: String, default: 'ShopSphere Certified Tech Partners' },
  returnPolicy: { type: String, default: '15-day risk-free return & exchange policy' },
  sustainabilityClaims: { type: String, default: 'Carbon-neutral shipping certified' },
  verificationSource: { type: String, default: 'Independent GreenTech Audits' },
  lastVerifiedAt: { type: Date, default: Date.now }
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    SKU: { type: String, required: true, unique: true, uppercase: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    images: [{ type: String, required: true }],
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    currency: { type: String, default: 'INR' },
    variants: [variantSchema],
    stock: { type: Number, required: true, default: 0, min: 0 },
    specifications: [specificationSchema],
    tags: [{ type: String, lowercase: true, trim: true }],
    ratingSummary: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
      distribution: {
        5: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        1: { type: Number, default: 0 },
      }
    },
    productPassport: { type: productPassportSchema, default: () => ({}) },
    catalogRank: { type: Number, default: 1000, index: true },
    ownershipCare: {
      manualUrl: { type: String, default: '#' },
      serviceContact: { type: String, default: 'support@shopsphere.com' },
      warrantyPeriodMonths: { type: Number, default: 12 }
    },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    salesCount: { type: Number, default: 0 },
    status: { type: String, enum: ['published', 'draft', 'archived'], default: 'published' }
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ 'ratingSummary.average': -1 });
productSchema.index({ salesCount: -1 });

export const Product = mongoose.model('Product', productSchema);
