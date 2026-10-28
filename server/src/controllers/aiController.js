import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Brand } from '../models/Brand.js';
import { successResponse } from '../utils/responseHelper.js';

export const handleAiChat = async (req, res, next) => {
  try {
    const { message = '' } = req.body;
    const cleanMsg = message.trim().toLowerCase();

    if (!cleanMsg) {
      return successResponse(res, 200, 'AI response ready', {
        reply: "Hello! I'm your ShopSphere Concierge. How can I assist your discovery today? You can ask me for product recommendations, budget finds, or sustainability insights.",
        products: []
      });
    }

    // 1. Check for FAQ / Policy inquiries
    if (cleanMsg.includes('return') || cleanMsg.includes('refund')) {
      return successResponse(res, 200, 'AI response ready', {
        reply: "ShopSphere offers a transparent 30-day return policy on all eligible items. You can initiate a hassle-free return directly from your Account Dashboard under 'Return Requests'.",
        products: []
      });
    }

    if (cleanMsg.includes('shipping') || cleanMsg.includes('delivery')) {
      return successResponse(res, 200, 'AI response ready', {
        reply: "We provide Free Standard Shipping on all orders over ₹2,000! Deliveries typically take 2-4 business days with end-to-end carbon-neutral logistics tracking.",
        products: []
      });
    }

    if (cleanMsg.includes('product passport') || cleanMsg.includes('sustainability') || cleanMsg.includes('repair')) {
      const topEcoProducts = await Product.find({
        status: 'published',
        'productPassport.repairability': { $gte: 7 }
      })
        .populate('brand', 'name')
        .populate('category', 'name')
        .sort({ 'productPassport.repairability': -1 })
        .limit(3)
        .lean();

      return successResponse(res, 200, 'AI response ready', {
        reply: "Every item on ShopSphere includes a verified Product Passport detailing its repairability index, carbon footprint, and material provenance. Here are our top-rated circular and sustainable picks:",
        products: topEcoProducts
      });
    }

    // 2. Extract Budget / Price constraint
    let maxPrice = null;
    let minPrice = null;
    const priceUnderMatch = cleanMsg.match(/(?:under|below|less than|within|budget of?)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)?)/i);
    if (priceUnderMatch) {
      maxPrice = parseInt(priceUnderMatch[1].replace(/,/g, ''), 10);
      // Handle 'k' notation e.g. 10k
      if (cleanMsg.includes(`${priceUnderMatch[1]}k`)) {
        maxPrice = maxPrice * 1000;
      }
    }

    // 3. Search query filters
    const filter = { status: 'published' };
    if (maxPrice) {
      filter.price = { ...(filter.price || {}), $lte: maxPrice };
    }
    if (minPrice) {
      filter.price = { ...(filter.price || {}), $gte: minPrice };
    }

    // Keyword detection
    const keywords = ['desk', 'chair', 'audio', 'headphone', 'earphone', 'watch', 'keyboard', 'coffee', 'lamp', 'bag', 'camera', 'bottle', 'speaker', 'stand', 'mouse'];
    const matchedKeyword = keywords.find((k) => cleanMsg.includes(k));

    if (matchedKeyword) {
      filter.$or = [
        { name: { $regex: matchedKeyword, $options: 'i' } },
        { shortDescription: { $regex: matchedKeyword, $options: 'i' } },
        { tags: { $in: [new RegExp(matchedKeyword, 'i')] } }
      ];
    } else {
      // General text or regex search on significant words
      const words = cleanMsg.split(/\s+/).filter((w) => w.length > 3 && !['find', 'show', 'want', 'need', 'give', 'good', 'best', 'some', 'with', 'under', 'from'].includes(w));
      if (words.length > 0) {
        filter.$or = words.map((w) => ({
          name: { $regex: w, $options: 'i' }
        }));
      }
    }

    let products = await Product.find(filter)
      .populate('brand', 'name')
      .populate('category', 'name')
      .sort({ 'ratingSummary.average': -1, price: 1 })
      .limit(4)
      .lean();

    // Fallback if strict filter yields nothing
    if (products.length === 0) {
      products = await Product.find({ status: 'published', isFeatured: true })
        .populate('brand', 'name')
        .populate('category', 'name')
        .limit(3)
        .lean();

      return successResponse(res, 200, 'AI response ready', {
        reply: `I couldn't find an exact match for "${message}", but here are some of our most celebrated curated selections that you might love:`,
        products
      });
    }

    const priceInfo = maxPrice ? ` within ₹${maxPrice.toLocaleString()}` : '';
    return successResponse(res, 200, 'AI response ready', {
      reply: `I hand-picked these high-affinity products for you${priceInfo}. Each one features certified quality and full Product Passport transparency:`,
      products
    });
  } catch (err) {
    next(err);
  }
};
