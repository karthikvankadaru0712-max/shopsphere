import mongoose from 'mongoose';

const newsletterSubscriptionSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
    source: { type: String, default: 'homepage_footer' }
  },
  { timestamps: true }
);

export const NewsletterSubscription = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);
