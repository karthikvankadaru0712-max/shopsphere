import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: 'products',
      populate: { path: 'brand', select: 'name' }
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }

    return successResponse(res, 200, 'Wishlist retrieved', {
      products: wishlist.products,
      count: wishlist.products.length
    });
  } catch (err) {
    next(err);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    const index = wishlist.products.findIndex((p) => p.toString() === productId);
    let action = 'added';

    if (index > -1) {
      wishlist.products.splice(index, 1);
      action = 'removed';
    } else {
      wishlist.products.push(productId);
    }

    await wishlist.save();
    return successResponse(res, 200, `Product ${action} ${action === 'added' ? 'to' : 'from'} wishlist`, {
      action,
      productId,
      count: wishlist.products.length
    });
  } catch (err) {
    next(err);
  }
};
