import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';
import { PriceAlert } from '../models/PriceAlert.js';
import { Notification } from '../models/Notification.js';
import { Coupon } from '../models/Coupon.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

// 1. SMARTCART ASSISTANT
export const getSmartCartAnalysis = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { guestId, budget: userBudget = 10000 } = req.body;

    let cart = null;
    if (userId) cart = await Cart.findOne({ user: userId });
    else if (guestId) cart = await Cart.findOne({ guestId });

    const budget = Number(userBudget) || 10000;

    if (!cart || cart.items.length === 0) {
      return successResponse(res, 200, 'SmartCart analysis for empty cart', {
        budget,
        cartTotal: 0,
        remainingBudget: budget,
        budgetUsagePercent: 0,
        isOverBudget: false,
        overBudgetAmount: 0,
        topConsumingItems: [],
        alternatives: [],
        potentialTotalSavings: 0
      });
    }

    let subtotal = 0;
    const items = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product).populate('category', 'name slug');
      if (!product) continue;

      let price = product.price;
      if (item.variantId) {
        const v = product.variants.id(item.variantId);
        if (v) price = v.price;
      }

      const totalItemCost = price * item.quantity;
      subtotal += totalItemCost;

      items.push({
        cartItemId: item._id,
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images[0],
        price,
        quantity: item.quantity,
        totalCost: totalItemCost,
        category: product.category
      });
    }

    const shipping = subtotal >= 2000 ? 0 : 150;
    const tax = Math.round(subtotal * 0.18);
    const cartTotal = subtotal + shipping;

    const remainingBudget = budget - cartTotal;
    const isOverBudget = remainingBudget < 0;
    const overBudgetAmount = isOverBudget ? Math.abs(remainingBudget) : 0;
    const budgetUsagePercent = Math.min(200, Math.round((cartTotal / budget) * 100));

    // Sort items by cost descending to find top budget consumers
    const topConsumingItems = [...items].sort((a, b) => b.totalCost - a.totalCost);

    // Look for cheaper alternatives for the top consumers
    const alternatives = [];
    let potentialTotalSavings = 0;

    for (const topItem of topConsumingItems.slice(0, 3)) {
      if (!topItem.category) continue;

      const cheaperAlternative = await Product.findOne({
        _id: { $ne: topItem.productId },
        category: topItem.category._id,
        price: { $lt: topItem.price },
        stock: { $gt: 0 },
        status: 'published'
      })
        .sort({ 'ratingSummary.average': -1, price: 1 })
        .lean();

      if (cheaperAlternative) {
        const savingsPerUnit = topItem.price - cheaperAlternative.price;
        const totalPotentialSavings = savingsPerUnit * topItem.quantity;
        potentialTotalSavings += totalPotentialSavings;

        alternatives.push({
          targetCartItem: {
            id: topItem.cartItemId,
            name: topItem.name,
            currentPrice: topItem.price,
            quantity: topItem.quantity
          },
          alternativeProduct: {
            _id: cheaperAlternative._id,
            name: cheaperAlternative.name,
            slug: cheaperAlternative.slug,
            image: cheaperAlternative.images[0],
            price: cheaperAlternative.price,
            rating: cheaperAlternative.ratingSummary?.average || 4.5,
            stock: cheaperAlternative.stock
          },
          savingsPerUnit,
          totalSavings: totalPotentialSavings
        });
      }
    }

    return successResponse(res, 200, 'SmartCart analysis calculated', {
      budget,
      cartTotal,
      subtotal,
      shipping,
      tax,
      remainingBudget: Math.max(0, remainingBudget),
      isOverBudget,
      overBudgetAmount,
      budgetUsagePercent,
      topConsumingItems: topConsumingItems.slice(0, 3),
      alternatives,
      potentialTotalSavings
    });
  } catch (err) {
    next(err);
  }
};

// 2. MATCHSCORE — INTERACTIVE PREFERENCE FINDER
export const calculateMatchScore = async (req, res, next) => {
  try {
    const {
      budget = 50000,
      category,
      brand,
      intendedUse = 'everyday',
      priority = 'balanced', // 'budget', 'performance', 'sustainability', 'features'
      requiredFeatures = []
    } = req.body;

    const filter = { status: 'published' };
    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .populate('brand', 'name')
      .populate('category', 'name')
      .limit(30)
      .lean();

    const scoredProducts = products.map((product) => {
      let score = 50; // base score
      const reasons = [];
      const tradeOffs = [];

      // Budget scoring
      const price = product.price;
      const budgetNum = Number(budget) || 50000;

      if (price <= budgetNum) {
        const budgetRatio = price / budgetNum;
        if (budgetRatio <= 0.8) {
          score += 20;
          reasons.push(`Well under budget: saves ₹${(budgetNum - price).toLocaleString()}`);
        } else {
          score += 15;
          reasons.push('Comfortably fits inside your budget');
        }
      } else {
        const excess = price - budgetNum;
        score -= Math.min(30, Math.round((excess / budgetNum) * 50));
        tradeOffs.push(`Exceeds budget by ₹${excess.toLocaleString()}`);
      }

      // Rating bonus
      const rating = product.ratingSummary?.average || 0;
      if (rating >= 4.5) {
        score += 15;
        reasons.push(`Top customer satisfaction rating (${rating} / 5.0)`);
      } else if (rating >= 4.0) {
        score += 10;
        reasons.push(`Solid positive user reviews (${rating} / 5.0)`);
      } else if (rating < 3.5 && rating > 0) {
        score -= 10;
        tradeOffs.push('Mixed customer review feedback');
      }

      // Sustainability & Product Passport
      const repairability = product.productPassport?.repairability || 5;
      if (repairability >= 8) {
        score += 8;
        reasons.push(`High repairability score (${repairability}/10) & sustainable packaging`);
      }

      // Brand preference match
      if (brand && product.brand?._id?.toString() === brand.toString()) {
        score += 12;
        reasons.push(`Manufactured by your preferred brand ${product.brand.name}`);
      }

      // Feature keywords in specs or description
      if (requiredFeatures && requiredFeatures.length > 0) {
        let matchedCount = 0;
        const textToSearch = (product.description + ' ' + (product.tags || []).join(' ')).toLowerCase();
        for (const feat of requiredFeatures) {
          if (textToSearch.includes(feat.toLowerCase())) {
            matchedCount++;
          }
        }
        if (matchedCount > 0) {
          score += matchedCount * 5;
          reasons.push(`Includes ${matchedCount} of your specified requirements`);
        }
      }

      // Stock check
      if (product.stock <= 3 && product.stock > 0) {
        tradeOffs.push(`Low stock alert: only ${product.stock} units remaining`);
      } else if (product.stock === 0) {
        score -= 25;
        tradeOffs.push('Currently on backorder / out of stock');
      }

      // Clamp score between 20% and 98%
      const matchPercentage = Math.min(98, Math.max(25, Math.round(score)));

      return {
        product,
        matchPercentage,
        reasons: reasons.slice(0, 3),
        tradeOffs: tradeOffs.slice(0, 2)
      };
    });

    scoredProducts.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return successResponse(res, 200, 'MatchScore recommendations generated', {
      totalAnalyzed: products.length,
      topMatches: scoredProducts.slice(0, 10)
    });
  } catch (err) {
    next(err);
  }
};

// 3. VIBEFIND — OCCASION & LIFESTYLE CURATED SHOWCASES
export const getVibeFindCurations = async (req, res, next) => {
  try {
    const { vibe = 'work-setup' } = req.query;

    const vibeMap = {
      'college-essentials': {
        title: 'College Essentials',
        subtitle: 'Sleek, durable backpacks, student tech & audio gear for campus focus.',
        tags: ['student', 'audio', 'backpack', 'portable', 'study', 'laptop']
      },
      'work-setup': {
        title: 'Dream Desk & Work Setup',
        subtitle: 'Ergonomic accessories, ambient lighting & distraction-free tech.',
        tags: ['office', 'desk', 'ergonomic', 'productivity', 'keyboard', 'monitor']
      },
      'travel-kit': {
        title: 'Nomad & Travel Kit',
        subtitle: 'Compact essentials, noise-cancelling headphones & fast charging hubs.',
        tags: ['travel', 'portable', 'wireless', 'battery', 'audio']
      },
      'minimal-lifestyle': {
        title: 'Minimal Lifestyle',
        subtitle: 'Timeless aesthetics, natural textures, and clutter-free living tools.',
        tags: ['minimal', 'lifestyle', 'home', 'clean', 'eco-friendly']
      },
      'fitness-active': {
        title: 'Fitness & Active Living',
        subtitle: 'Sweatproof audio, smart health tracking, and hydration vessels.',
        tags: ['fitness', 'sports', 'smartwatch', 'wearable', 'waterproof']
      }
    };

    const currentVibe = vibeMap[vibe] || vibeMap['work-setup'];

    const products = await Product.find({
      $or: [
        { tags: { $in: currentVibe.tags } },
        { isFeatured: true }
      ],
      status: 'published'
    })
      .populate('brand', 'name')
      .populate('category', 'name')
      .limit(8)
      .lean();

    return successResponse(res, 200, 'VibeFind curation retrieved', {
      vibeKey: vibe,
      vibeInfo: currentVibe,
      availableVibes: Object.keys(vibeMap).map((k) => ({ key: k, title: vibeMap[k].title })),
      products
    });
  } catch (err) {
    next(err);
  }
};

// 4. GIFT FINDER QUIZ
export const getGiftFinderRecommendations = async (req, res, next) => {
  try {
    const { occasion, recipient, minPrice = 0, maxPrice = 50000, category } = req.body;

    const query = {
      price: { $gte: Number(minPrice), $lte: Number(maxPrice) },
      status: 'published',
      stock: { $gt: 0 }
    };

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate('brand', 'name')
      .populate('category', 'name')
      .sort({ 'ratingSummary.average': -1, salesCount: -1 })
      .limit(12)
      .lean();

    const gifts = products.map((product) => {
      let giftHighlight = 'Crowd-favorite lifestyle gift with verified ratings.';
      if (recipient === 'tech-lover') giftHighlight = 'Cutting-edge tech crafted with premium materials.';
      else if (recipient === 'student') giftHighlight = 'Essential daily companion for campus productivity.';
      else if (recipient === 'creator') giftHighlight = 'High-fidelity tool designed for artistic precision.';

      return {
        ...product,
        giftHighlight,
        suitableFor: `${recipient ? recipient.replace('-', ' ') : 'everyone'} on ${occasion || 'any special day'}`
      };
    });

    return successResponse(res, 200, 'Gift recommendations generated', {
      occasion,
      recipient,
      resultsCount: gifts.length,
      gifts
    });
  } catch (err) {
    next(err);
  }
};

// 5. PRICE PULSE TARGET ALERTS
export const createPriceAlert = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, targetPrice } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    if (targetPrice >= product.price) {
      return errorResponse(
        res,
        400,
        `Target price (₹${targetPrice}) must be lower than the current price (₹${product.price})`
      );
    }

    const alert = await PriceAlert.findOneAndUpdate(
      { user: userId, product: productId },
      { targetPrice, isActive: true },
      { upsert: true, new: true }
    );

    return successResponse(res, 201, 'Target price alert set successfully', { alert });
  } catch (err) {
    next(err);
  }
};

export const getMyPriceAlerts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const alerts = await PriceAlert.find({ user: userId })
      .populate({
        path: 'product',
        select: 'name slug price images compareAtPrice'
      })
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Active price alerts retrieved', { alerts });
  } catch (err) {
    next(err);
  }
};

export const deletePriceAlert = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    await PriceAlert.findOneAndDelete({ _id: id, user: userId });
    return successResponse(res, 200, 'Price alert removed');
  } catch (err) {
    next(err);
  }
};

// 6. OWNERSHIP HUB & AFTERCARE (POST-PURCHASE LIBRARY)
export const getOwnershipHubProducts = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch all eligible customer orders that are paid/delivered
    const orders = await Order.find({
      customer: userId,
      paymentStatus: 'paid'
    }).sort({ createdAt: -1 });

    const ownedMap = new Map();

    for (const order of orders) {
      for (const item of order.items) {
        const prodId = item.product.toString();
        if (!ownedMap.has(prodId)) {
          const product = await Product.findById(item.product).populate('brand', 'name');
          if (product) {
            const purchaseDate = order.createdAt;
            const warrantyMonths = product.ownershipCare?.warrantyPeriodMonths || 12;
            const expiryDate = new Date(purchaseDate);
            expiryDate.setMonth(expiryDate.getMonth() + warrantyMonths);

            const now = new Date();
            const isWarrantyActive = now < expiryDate;
            const daysRemaining = isWarrantyActive
              ? Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
              : 0;

            ownedMap.set(prodId, {
              orderId: order._id,
              orderNumber: order.orderNumber,
              purchaseDate,
              product: {
                _id: product._id,
                name: product.name,
                slug: product.slug,
                image: product.images[0],
                brand: product.brand?.name || 'ShopSphere',
                priceAtPurchase: item.price
              },
              warranty: {
                durationMonths: warrantyMonths,
                expiryDate,
                isActive: isWarrantyActive,
                daysRemaining
              },
              productPassport: product.productPassport,
              careInstructions: product.productPassport?.careInstructions || 'Clean with microfiber cloth.',
              manualUrl: product.ownershipCare?.manualUrl || '#',
              supportContact: product.ownershipCare?.serviceContact || 'support@shopsphere.com'
            });
          }
        }
      }
    }

    const ownedProducts = Array.from(ownedMap.values());

    return successResponse(res, 200, 'Ownership Hub product library retrieved', {
      totalOwned: ownedProducts.length,
      ownedProducts
    });
  } catch (err) {
    next(err);
  }
};
