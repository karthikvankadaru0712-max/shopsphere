import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Coupon } from '../models/Coupon.js';
import { Review } from '../models/Review.js';
import { Category } from '../models/Category.js';
import { Brand } from '../models/Brand.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { ReturnRequest } from '../models/ReturnRequest.js';
import { PriceHistory } from '../models/PriceHistory.js';
import { AuditLog } from '../models/AuditLog.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

// Helper to log administrative actions
const recordAuditLog = async (req, action, entity, entityId, details) => {
  try {
    await AuditLog.create({
      actor: req.user?.email || 'admin@shopsphere.com',
      actorRole: req.user?.role || 'admin',
      action,
      entity,
      entityId: entityId ? entityId.toString() : null,
      details,
      ipAddress: req.ip || ''
    });
  } catch (err) {
    console.error('AuditLog error:', err);
  }
};

// 1. DASHBOARD OVERVIEW & ANALYTICS
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const [totalOrders, eligibleOrders, totalCustomers, lowStockProducts, recentOrders, topProducts] =
      await Promise.all([
        Order.countDocuments(),
        Order.find({ paymentStatus: 'paid' }).lean(),
        User.countDocuments({ role: 'customer' }),
        Product.countDocuments({ stock: { $lte: 5 }, status: 'published' }),
        Order.find().populate('customer', 'name email').sort({ createdAt: -1 }).limit(6).lean(),
        Product.find({ status: 'published' }).sort({ salesCount: -1 }).limit(5).lean()
      ]);

    // Calculate revenue from eligible paid orders
    const totalRevenue = eligibleOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = eligibleOrders.length > 0 ? Math.round(totalRevenue / eligibleOrders.length) : 0;

    // Fulfillment status breakdown
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$fulfillmentStatus', count: { $sum: 1 } } }
    ]);

    const statusBreakdown = statusCounts.map((s) => ({
      name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
      value: s.count
    }));

    // Sales over time (group by month/recent dates)
    const salesOverTime = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 14 }
    ]);

    // Category distribution
    const categoryDistribution = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      { $unwind: '$categoryDetails' },
      { $project: { name: '$categoryDetails.name', count: 1 } }
    ]);

    return successResponse(res, 200, 'Admin analytics loaded', {
      kpis: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        totalCustomers,
        lowStockProducts
      },
      recentOrders,
      topProducts,
      statusBreakdown,
      salesOverTime: salesOverTime.map((s) => ({ date: s._id, revenue: s.revenue, orders: s.orders })),
      categoryDistribution
    });
  } catch (err) {
    next(err);
  }
};

// 2. PRODUCT MANAGEMENT (CRUD)
export const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;

    const slug = productData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const sku = productData.SKU || `SKU-${Math.floor(100000 + Math.random() * 900000)}`;

    const product = await Product.create({
      ...productData,
      slug,
      SKU: sku
    });

    // Record initial price history
    await PriceHistory.create({
      product: product._id,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      reason: 'Initial Launch'
    });

    await recordAuditLog(req, 'CREATE_PRODUCT', 'Product', product._id, { name: product.name, price: product.price });

    return successResponse(res, 201, 'Product created successfully', { product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return errorResponse(res, 404, 'Product not found');
    }

    // Check if price changed
    if (updateData.price && updateData.price !== existingProduct.price) {
      await PriceHistory.create({
        product: existingProduct._id,
        price: updateData.price,
        compareAtPrice: updateData.compareAtPrice || existingProduct.compareAtPrice,
        reason: 'Admin Price Update'
      });
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
    await recordAuditLog(req, 'UPDATE_PRODUCT', 'Product', id, { updatedFields: Object.keys(updateData) });

    return successResponse(res, 200, 'Product updated successfully', { product: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { status: 'archived' }, { new: true });
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    await recordAuditLog(req, 'ARCHIVE_PRODUCT', 'Product', id, { name: product.name });
    return successResponse(res, 200, 'Product archived successfully');
  } catch (err) {
    next(err);
  }
};

// 3. ORDER MANAGEMENT
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.fulfillmentStatus = status;
    }

    if (search) {
      query.orderNumber = new RegExp(search.trim(), 'i');
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalCount] = await Promise.all([
      Order.find(query)
        .populate('customer', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query)
    ]);

    return successResponse(res, 200, 'Orders retrieved', {
      orders,
      pagination: {
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum) || 1,
        page: pageNum,
        limit: limitNum
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    const oldStatus = order.fulfillmentStatus;
    order.fulfillmentStatus = status;
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }

    order.statusHistory.push({
      status,
      note: note || `Status changed from ${oldStatus} to ${status}`,
      actor: req.user.email
    });

    await order.save();
    await recordAuditLog(req, 'UPDATE_ORDER_STATUS', 'Order', id, { from: oldStatus, to: status, note });

    return successResponse(res, 200, 'Order status updated', { order });
  } catch (err) {
    next(err);
  }
};

// 4. INVENTORY MANAGEMENT
export const getInventory = async (req, res, next) => {
  try {
    const { lowStockOnly } = req.query;
    const filter = { status: 'published' };
    if (lowStockOnly === 'true') {
      filter.stock = { $lte: 5 };
    }

    const products = await Product.find(filter)
      .populate('brand', 'name')
      .populate('category', 'name')
      .select('name SKU stock price variants images ratingSummary status')
      .sort({ stock: 1 })
      .lean();

    return successResponse(res, 200, 'Inventory list loaded', { products });
  } catch (err) {
    next(err);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const { productId, quantityChange, reason = 'manual_adjustment' } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    const prevStock = product.stock;
    const newStock = prevStock + Number(quantityChange);
    if (newStock < 0) {
      return errorResponse(res, 400, 'Stock cannot be negative');
    }

    product.stock = newStock;
    await product.save();

    await InventoryMovement.create({
      product: product._id,
      sku: product.SKU,
      quantityChange: Number(quantityChange),
      previousStock: prevStock,
      newStock,
      reason,
      actor: req.user.email
    });

    await recordAuditLog(req, 'ADJUST_STOCK', 'Product', productId, {
      prevStock,
      newStock,
      quantityChange
    });

    return successResponse(res, 200, 'Stock updated successfully', {
      product: { _id: product._id, name: product.name, stock: product.stock }
    });
  } catch (err) {
    next(err);
  }
};

// 5. COUPON MANAGEMENT
export const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return successResponse(res, 200, 'Coupons list', { coupons });
  } catch (err) {
    next(err);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const couponData = req.body;
    couponData.code = couponData.code.trim().toUpperCase();

    const existing = await Coupon.findOne({ code: couponData.code });
    if (existing) {
      return errorResponse(res, 409, 'A coupon with this code already exists');
    }

    const coupon = await Coupon.create(couponData);
    await recordAuditLog(req, 'CREATE_COUPON', 'Coupon', coupon._id, { code: coupon.code });

    return successResponse(res, 201, 'Coupon created', { coupon });
  } catch (err) {
    next(err);
  }
};

export const toggleCouponStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) return errorResponse(res, 404, 'Coupon not found');

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    await recordAuditLog(req, 'TOGGLE_COUPON', 'Coupon', id, { isActive: coupon.isActive });
    return successResponse(res, 200, `Coupon is now ${coupon.isActive ? 'active' : 'inactive'}`, { coupon });
  } catch (err) {
    next(err);
  }
};

// 6. REVIEW MODERATION
export const getAdminReviews = async (req, res, next) => {
  try {
    const { status = 'all' } = req.query;
    const query = {};
    if (status !== 'all') query.status = status;

    const reviews = await Review.find(query)
      .populate('user', 'name email avatar')
      .populate('product', 'name slug images')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, 200, 'Reviews for moderation loaded', { reviews });
  } catch (err) {
    next(err);
  }
};

export const moderateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved', 'rejected'

    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) return errorResponse(res, 404, 'Review not found');

    await recordAuditLog(req, 'MODERATE_REVIEW', 'Review', id, { newStatus: status });
    return successResponse(res, 200, `Review status updated to ${status}`, { review });
  } catch (err) {
    next(err);
  }
};

// 7. RETURN PROCESSING
export const getAdminReturns = async (req, res, next) => {
  try {
    const returns = await ReturnRequest.find()
      .populate('user', 'name email')
      .populate('order', 'orderNumber total')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, 200, 'Return requests loaded', { returns });
  } catch (err) {
    next(err);
  }
};

export const resolveReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body; // 'approved', 'rejected', 'completed'

    const returnReq = await ReturnRequest.findById(id);
    if (!returnReq) return errorResponse(res, 404, 'Return request not found');

    returnReq.status = status;
    returnReq.adminNotes = adminNotes || returnReq.adminNotes;
    await returnReq.save();

    await recordAuditLog(req, 'RESOLVE_RETURN', 'ReturnRequest', id, { status, adminNotes });
    return successResponse(res, 200, `Return request status set to ${status}`, { returnReq });
  } catch (err) {
    next(err);
  }
};

// 8. AUDIT LOGS
export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50).lean();
    return successResponse(res, 200, 'Audit logs retrieved', { logs });
  } catch (err) {
    next(err);
  }
};
