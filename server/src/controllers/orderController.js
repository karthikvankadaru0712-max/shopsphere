import crypto from 'crypto';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { Payment } from '../models/Payment.js';
import { Coupon } from '../models/Coupon.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { Notification } from '../models/Notification.js';
import { ReturnRequest } from '../models/ReturnRequest.js';
import { config } from '../config/environment.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { broadcastNewOrder, broadcastLowStock } from '../socket.js';

export const getCheckoutQuote = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { guestId, couponCode, items: requestedItems } = req.body;

    let cartItems = [];
    if (requestedItems && requestedItems.length > 0) {
      cartItems = requestedItems;
    } else {
      let cart = null;
      if (userId) cart = await Cart.findOne({ user: userId });
      else if (guestId) cart = await Cart.findOne({ guestId });
      if (cart) cartItems = cart.items;
    }

    if (!cartItems || cartItems.length === 0) {
      return errorResponse(res, 400, 'Cannot generate quote for empty items');
    }

    let subtotal = 0;
    const lineItems = [];
    const stockErrors = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.product || item.productId);
      if (!product || product.status !== 'published') {
        stockErrors.push(`Product is no longer available.`);
        continue;
      }

      let price = product.price;
      if (item.variantId) {
        const variant = product.variants.id(item.variantId);
        if (variant) price = variant.price;
      }

      if (product.stock < item.quantity) {
        stockErrors.push(`"${product.name}" only has ${product.stock} units available.`);
      }

      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      lineItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0],
        price,
        quantity: item.quantity,
        variantId: item.variantId || null,
        selectedAttributes: item.selectedAttributes || {},
        sku: product.SKU,
        itemTotal
      });
    }

    if (stockErrors.length > 0) {
      return errorResponse(res, 400, 'Stock validation failed', stockErrors);
    }

    // Validate coupon if provided
    let discount = 0;
    let couponDetails = null;
    const codeToTest = couponCode || (cartItems.appliedCoupon?.code);
    if (codeToTest) {
      const coupon = await Coupon.findOne({ code: codeToTest.trim().toUpperCase() });
      if (coupon) {
        const validation = coupon.isValidForOrder(subtotal);
        if (validation.valid) {
          discount = coupon.calculateDiscount(subtotal);
          couponDetails = {
            code: coupon.code,
            discountAmount: discount,
            discountType: coupon.discountType
          };
        }
      }
    }

    const shipping = subtotal >= 2000 || subtotal === 0 ? 0 : 150;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableAmount * 0.18);
    const total = taxableAmount + shipping;

    return successResponse(res, 200, 'Authoritative quote calculated', {
      lineItems,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      couponDetails
    });
  } catch (err) {
    next(err);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      deliveryAddress,
      shippingMethod = 'Standard Tracked Delivery',
      paymentMethod = 'mock',
      couponCode,
      guestId
    } = req.body;

    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.street || !deliveryAddress.city) {
      return errorResponse(res, 400, 'Complete delivery address is required');
    }

    // Retrieve active cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return errorResponse(res, 400, 'Your cart is empty');
    }

    // Validate stock and snapshot items
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product || product.status !== 'published') {
        return errorResponse(res, 400, `An item in your cart is no longer available.`);
      }

      if (product.stock < item.quantity) {
        return errorResponse(
          res,
          400,
          `Insufficient stock for ${product.name}. Only ${product.stock} available.`
        );
      }

      let price = product.price;
      if (item.variantId) {
        const variant = product.variants.id(item.variantId);
        if (variant) price = variant.price;
      }

      subtotal += price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0],
        price,
        quantity: item.quantity,
        variantId: item.variantId || null,
        selectedAttributes: item.selectedAttributes || {},
        sku: product.SKU
      });
    }

    // Coupon discount
    let discount = 0;
    let couponSnapshot = null;
    const appliedCode = couponCode || cart.appliedCoupon?.code;
    if (appliedCode) {
      const coupon = await Coupon.findOne({ code: appliedCode.toUpperCase() });
      if (coupon && coupon.isValidForOrder(subtotal).valid) {
        discount = coupon.calculateDiscount(subtotal);
        couponSnapshot = {
          code: coupon.code,
          discountAmount: discount,
          discountType: coupon.discountType
        };
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const shipping = subtotal >= 2000 ? 0 : 150;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableAmount * 0.18);
    const total = taxableAmount + shipping;

    const orderNumber = `SPHERE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const isMockOrCod = paymentMethod === 'mock' || paymentMethod === 'cod';

    const order = await Order.create({
      orderNumber,
      customer: userId,
      items: orderItems,
      deliveryAddress,
      shippingMethod,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      currency: 'INR',
      paymentMethod,
      paymentStatus: paymentMethod === 'mock' ? 'paid' : 'pending',
      fulfillmentStatus: paymentMethod === 'mock' ? 'confirmed' : 'processing',
      statusHistory: [
        {
          status: paymentMethod === 'mock' ? 'confirmed' : 'processing',
          note: `Order placed via ${paymentMethod.toUpperCase()}`,
          actor: 'customer'
        }
      ],
      couponSnapshot
    });

    // Deduct stock & record inventory movements
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const prevStock = product.stock;
        product.stock = Math.max(0, product.stock - item.quantity);
        product.salesCount += item.quantity;
        await product.save();

        await InventoryMovement.create({
          product: product._id,
          sku: item.sku,
          quantityChange: -item.quantity,
          previousStock: prevStock,
          newStock: product.stock,
          reason: 'order_fulfillment',
          actor: `order:${order.orderNumber}`,
          order: order._id
        });
      }
    }

    // Create Payment Record
    await Payment.create({
      order: order._id,
      provider: paymentMethod,
      providerOrderId: `PAY-${orderNumber}`,
      paymentId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      amount: total,
      currency: 'INR',
      status: paymentMethod === 'mock' ? 'captured' : 'pending',
      verificationMetadata: { simulation: true, placedAt: new Date() }
    });

    // Clear cart
    cart.items = [];
    cart.appliedCoupon = undefined;
    await cart.save();

    // Create Notification
    await Notification.create({
      user: userId,
      type: 'order_status',
      title: 'Order Confirmed!',
      message: `Your order #${orderNumber} for ₹${total.toLocaleString()} has been placed successfully.`,
      link: `/account/orders/${order._id}`
    });

    // Real-Time Socket Broadcasts
    try {
      broadcastNewOrder(order);
      for (const item of orderItems) {
        const prod = await Product.findById(item.product);
        if (prod && prod.stock <= 5) {
          broadcastLowStock(prod);
        }
      }
    } catch (sockErr) {
      console.warn('[Socket Broadcast Warning]', sockErr.message);
    }

    return successResponse(res, 201, 'Order created successfully', { order });
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ customer: userId }).sort({ createdAt: -1 });
    return successResponse(res, 200, 'Orders retrieved', { orders });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { id } = req.params;

    let query = { _id: id };
    if (userRole !== 'admin') {
      query.customer = userId;
    }

    const order = await Order.findOne(query).populate('customer', 'name email');
    if (!order) {
      return errorResponse(res, 404, 'Order not found or unauthorized');
    }

    return successResponse(res, 200, 'Order details retrieved', { order });
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: id, customer: userId });
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    if (!['processing', 'confirmed'].includes(order.fulfillmentStatus)) {
      return errorResponse(res, 400, `Cannot cancel order in "${order.fulfillmentStatus}" status.`);
    }

    order.fulfillmentStatus = 'cancelled';
    order.cancellationReason = reason || 'Cancelled by customer';
    order.cancelledAt = new Date();
    order.statusHistory.push({
      status: 'cancelled',
      note: reason || 'Customer requested cancellation',
      actor: 'customer'
    });
    await order.save();

    // Restock inventory
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const prev = product.stock;
        product.stock += item.quantity;
        await product.save();

        await InventoryMovement.create({
          product: product._id,
          sku: item.sku,
          quantityChange: item.quantity,
          previousStock: prev,
          newStock: product.stock,
          reason: 'cancellation_restock',
          actor: `cancel:${order.orderNumber}`,
          order: order._id
        });
      }
    }

    await Notification.create({
      user: userId,
      type: 'order_status',
      title: 'Order Cancelled',
      message: `Your order #${order.orderNumber} has been cancelled successfully.`,
      link: `/account/orders/${order._id}`
    });

    return successResponse(res, 200, 'Order cancelled successfully', { order });
  } catch (err) {
    next(err);
  }
};

export const requestReturn = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { reason, comments } = req.body;

    const order = await Order.findOne({ _id: id, customer: userId });
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    if (order.fulfillmentStatus !== 'delivered') {
      return errorResponse(res, 400, 'Returns can only be requested for delivered orders');
    }

    const existingReturn = await ReturnRequest.findOne({ order: order._id });
    if (existingReturn) {
      return errorResponse(res, 400, 'A return request already exists for this order');
    }

    const returnRequest = await ReturnRequest.create({
      order: order._id,
      user: userId,
      items: order.items.map((i) => ({
        product: i.product,
        name: i.name,
        quantity: i.quantity,
        price: i.price
      })),
      reason: reason || 'not_as_described',
      comments: comments || '',
      status: 'pending',
      refundAmount: order.total
    });

    order.fulfillmentStatus = 'returned';
    order.statusHistory.push({
      status: 'returned',
      note: `Return requested: ${reason}`,
      actor: 'customer'
    });
    await order.save();

    return successResponse(res, 201, 'Return request submitted successfully', { returnRequest });
  } catch (err) {
    next(err);
  }
};

export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return errorResponse(res, 400, 'Payment verification failed. Invalid signature.');
    }

    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = 'paid';
      order.fulfillmentStatus = 'confirmed';
      order.paymentReference = razorpay_payment_id;
      order.statusHistory.push({
        status: 'confirmed',
        note: `Razorpay payment verified: ${razorpay_payment_id}`,
        actor: 'payment_gateway'
      });
      await order.save();
    }

    return successResponse(res, 200, 'Payment verified successfully');
  } catch (err) {
    next(err);
  }
};
