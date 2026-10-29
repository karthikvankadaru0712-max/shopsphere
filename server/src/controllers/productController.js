import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Brand } from '../models/Brand.js';
import { PriceHistory } from '../models/PriceHistory.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      tag,
      sort = 'curated',
      page = 1,
      limit = 12
    } = req.query;

    const filter = { status: 'published' };

    // Search query
    if (q && q.trim()) {
      filter.$text = { $search: q.trim() };
    }

    // Category filter by slug or ID
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ slug: category.toLowerCase() });
        if (cat) filter.category = cat._id;
      }
    }

    // Brand filter by slug or ID
    if (brand) {
      if (brand.match(/^[0-9a-fA-F]{24}$/)) {
        filter.brand = brand;
      } else {
        const br = await Brand.findOne({ slug: brand.toLowerCase() });
        if (br) filter.brand = br._id;
      }
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Rating
    if (rating) {
      filter['ratingSummary.average'] = { $gte: Number(rating) };
    }

    // Stock availability
    if (inStock === 'true' || inStock === true) {
      filter.stock = { $gt: 0 };
    }

    // Tag filter
    if (tag) {
      filter.tags = tag.toLowerCase();
    }

    // Sorting
    let sortOption = { catalogRank: 1, createdAt: -1, _id: 1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'rating-desc') sortOption = { 'ratingSummary.average': -1 };
    else if (sort === 'bestseller') sortOption = { salesCount: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1, _id: -1 };
    else if (sort === 'curated') sortOption = { catalogRank: 1, createdAt: -1, _id: 1 };
    else if (sort === 'relevance' && q) sortOption = { score: { $meta: 'textScore' } };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .populate('brand', 'name slug logo')
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    return successResponse(res, 200, 'Products retrieved successfully', {
      products,
      pagination: {
        total: totalCount,
        totalPages,
        page: pageNum,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let query = { slug: slug.toLowerCase() };

    if (slug.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ slug: slug.toLowerCase() }, { _id: slug }] };
    }

    const product = await Product.findOne(query)
      .populate('brand', 'name slug logo description')
      .populate('category', 'name slug description');

    if (!product) {
      return errorResponse(res, 404, 'Product not found.');
    }

    return successResponse(res, 200, 'Product details retrieved', { product });
  } catch (err) {
    next(err);
  }
};

export const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return successResponse(res, 200, 'Suggestions', { suggestions: [] });
    }

    const regex = new RegExp(q.trim(), 'i');

    const [products, brands, categories] = await Promise.all([
      Product.find({ name: regex, status: 'published' }).select('name slug price images').limit(6).lean(),
      Brand.find({ name: regex, active: true }).select('name slug').limit(3).lean(),
      Category.find({ name: regex, active: true }).select('name slug').limit(3).lean()
    ]);

    const suggestions = [
      ...products.map((p) => ({ type: 'product', title: p.name, slug: p.slug, price: p.price, image: p.images[0] })),
      ...brands.map((b) => ({ type: 'brand', title: b.name, slug: b.slug })),
      ...categories.map((c) => ({ type: 'category', title: c.name, slug: c.slug }))
    ];

    return successResponse(res, 200, 'Suggestions retrieved', { suggestions });
  } catch (err) {
    next(err);
  }
};

export const getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const current = await Product.findById(id);
    if (!current) {
      return errorResponse(res, 404, 'Product not found');
    }

    const related = await Product.find({
      _id: { $ne: current._id },
      category: current.category,
      status: 'published'
    })
      .populate('brand', 'name')
      .populate('category', 'name')
      .limit(6)
      .lean();

    return successResponse(res, 200, 'Related products retrieved', { related });
  } catch (err) {
    next(err);
  }
};

export const getProductPriceHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).select('name price compareAtPrice');
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    const history = await PriceHistory.find({ product: id }).sort({ recordedAt: 1 }).lean();

    return successResponse(res, 200, 'Price history retrieved', {
      currentPrice: product.price,
      compareAtPrice: product.compareAtPrice,
      history
    });
  } catch (err) {
    next(err);
  }
};

export const getHomeCatalogSections = async (req, res, next) => {
  try {
    const [featured, trending, newArrivals, bestSellers, categories] = await Promise.all([
      Product.find({ isFeatured: true, status: 'published' }).populate('brand', 'name').limit(8).lean(),
      Product.find({ isTrending: true, status: 'published' }).populate('brand', 'name').limit(8).lean(),
      Product.find({ isNewArrival: true, status: 'published' }).populate('brand', 'name').limit(8).lean(),
      Product.find({ status: 'published' }).sort({ salesCount: -1 }).populate('brand', 'name').limit(8).lean(),
      Category.find({ active: true }).lean()
    ]);

    return successResponse(res, 200, 'Home catalog sections retrieved', {
      featured,
      trending,
      newArrivals,
      bestSellers,
      categories
    });
  } catch (err) {
    next(err);
  }
};
