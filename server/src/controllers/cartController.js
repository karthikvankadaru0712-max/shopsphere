import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

// Helper to calculate cart totals safely using current authoritative DB prices
const calculateCartTotals = async (cart) => {
  let subtotal = 0;
  const items = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.product).populate('brand', 'name');
    if (!product || product.status !== 'published') continue;

    let itemPrice = product.price;
    let variantDetails = null;

    if (item.variantId) {
      const variant = product.variants.id(item.variantId);
      if (variant) {
        itemPrice = variant.price;
        variantDetails = variant;
      }
    }

    const itemTotal = itemPrice * item.quantity;
    subtotal += itemTotal;

    items.push({
      _id: item._id,
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images[0],
        brand: product.brand?.name || 'ShopSphere',
        stock: product.stock
      },
      variantId: item.variantId,
      variantDetails,
      selectedAttributes: item.selectedAttributes,
      quantity: item.quantity,
      price: itemPrice,
      itemTotal
    });
  }

  // Calculate coupon discount
  let discount = 0;
  let couponInfo = null;
  if (cart.appliedCoupon && cart.appliedCoupon.code) {
    const coupon = await Coupon.findOne({ code: cart.appliedCoupon.code });
    if (coupon) {
      const validation = coupon.isValidForOrder(subtotal);
      if (validation.valid) {
        discount = coupon.calculateDiscount(subtotal);
        couponInfo = {
          code: coupon.code,
          discountAmount: discount,
          discountType: coupon.discountType,
          description: coupon.description
        };
      } else {
        cart.appliedCoupon = undefined;
        await cart.save();
      }
    }
  }

  // Configurable delivery rules: Free shipping over ₹2000, otherwise ₹150
  const shipping = subtotal === 0 || subtotal >= 2000 ? 0 : 150;
  const freeShippingThreshold = 2000;
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // Estimated Tax: 18% GST (already standard in India, transparently displayed)
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * 0.18);
  const total = taxableAmount + shipping;

  return {
    _id: cart._id,
    items,
    itemCount: items.reduce((acc, curr) => acc + curr.quantity, 0),
    subtotal,
    discount,
    shipping,
    tax,
    total,
    freeShippingThreshold,
    amountForFreeShipping,
    appliedCoupon: couponInfo
  };
};

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { guestId } = req.query;

    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (guestId) {
      cart = await Cart.findOne({ guestId });
    }

    if (!cart) {
      return successResponse(res, 200, 'Cart is empty', {
        items: [],
        itemCount: 0,
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        freeShippingThreshold: 2000,
        amountForFreeShipping: 2000,
        appliedCoupon: null
      });
    }

    const calculated = await calculateCartTotals(cart);
    return successResponse(res, 200, 'Cart retrieved', calculated);
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { productId, variantId, quantity = 1, guestId, selectedAttributes } = req.body;

    const product = await Product.findById(productId);
    if (!product || product.status !== 'published') {
      return errorResponse(res, 404, 'Product not found or unavailable');
    }

    if (product.stock < quantity) {
      return errorResponse(res, 400, `Only ${product.stock} items remaining in stock.`);
    }

    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
      if (!cart) cart = new Cart({ user: userId, items: [] });
    } else if (guestId) {
      cart = await Cart.findOne({ guestId });
      if (!cart) cart = new Cart({ guestId, items: [] });
    } else {
      return errorResponse(res, 400, 'User authentication or guestId is required');
    }

    // Check if item already in cart
    const existingIndex = cart.items.findIndex(
      (i) => i.product.toString() === productId &&
        (i.variantId?.toString() || null) === (variantId || null)
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        return errorResponse(res, 400, `Cannot add more. Only ${product.stock} in stock.`);
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({
        product: productId,
        variantId: variantId || null,
        quantity,
        selectedAttributes: selectedAttributes || {}
      });
    }

    await cart.save();
    const calculated = await calculateCartTotals(cart);
    return successResponse(res, 200, 'Item added to cart', calculated);
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { itemId } = req.params;
    const { quantity, guestId } = req.body;

    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (guestId) {
      cart = await Cart.findOne({ guestId });
    }

    if (!cart) {
      return errorResponse(res, 404, 'Cart not found');
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return errorResponse(res, 404, 'Item not found in cart');
    }

    if (quantity <= 0) {
      item.deleteOne();
    } else {
      const product = await Product.findById(item.product);
      if (product && quantity > product.stock) {
        return errorResponse(res, 400, `Only ${product.stock} in stock.`);
      }
      item.quantity = quantity;
    }

    await cart.save();
    const calculated = await calculateCartTotals(cart);
    return successResponse(res, 200, 'Cart updated', calculated);
  } catch (err) {
    next(err);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { itemId } = req.params;
    const { guestId } = req.query;

    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (guestId) {
      cart = await Cart.findOne({ guestId });
    }

    if (!cart) {
      return errorResponse(res, 404, 'Cart not found');
    }

    cart.items.pull({ _id: itemId });
    await cart.save();

    const calculated = await calculateCartTotals(cart);
    return successResponse(res, 200, 'Item removed from cart', calculated);
  } catch (err) {
    next(err);
  }
};

export const applyCoupon = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { code, guestId } = req.body;

    if (!code) {
      return errorResponse(res, 400, 'Coupon code is required');
    }

    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (guestId) {
      cart = await Cart.findOne({ guestId });
    }

    if (!cart || cart.items.length === 0) {
      return errorResponse(res, 400, 'Your cart is empty');
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (!coupon) {
      return errorResponse(res, 404, 'Invalid coupon code');
    }

    // Authoritative calculation of subtotal
    const calculated = await calculateCartTotals(cart);
    const validation = coupon.isValidForOrder(calculated.subtotal);
    if (!validation.valid) {
      return errorResponse(res, 400, validation.reason);
    }

    const discountAmount = coupon.calculateDiscount(calculated.subtotal);
    cart.appliedCoupon = {
      code: coupon.code,
      discountAmount,
      discountType: coupon.discountType
    };
    await cart.save();

    const updated = await calculateCartTotals(cart);
    return successResponse(res, 200, `Coupon ${coupon.code} applied successfully!`, updated);
  } catch (err) {
    next(err);
  }
};

export const removeCoupon = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { guestId } = req.body;

    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (guestId) {
      cart = await Cart.findOne({ guestId });
    }

    if (!cart) {
      return errorResponse(res, 404, 'Cart not found');
    }

    cart.appliedCoupon = undefined;
    await cart.save();

    const updated = await calculateCartTotals(cart);
    return successResponse(res, 200, 'Coupon removed', updated);
  } catch (err) {
    next(err);
  }
};
