import { SmartCollection } from '../models/SmartCollection.js';
import { Product } from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getMyCollections = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const collections = await SmartCollection.find({ owner: userId })
      .populate('products', 'name slug images price compareAtPrice')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Collections retrieved', { collections });
  } catch (err) {
    next(err);
  }
};

export const createCollection = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, description, visibility = 'private', productIds = [] } = req.body;

    if (!name || !name.trim()) {
      return errorResponse(res, 400, 'Collection name is required');
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existing = await SmartCollection.findOne({ owner: userId, slug });
    if (existing) {
      return errorResponse(res, 409, 'You already have a collection with this name');
    }

    const collection = await SmartCollection.create({
      owner: userId,
      name: name.trim(),
      slug,
      description,
      visibility,
      products: productIds
    });

    return successResponse(res, 201, 'Collection created successfully', { collection });
  } catch (err) {
    next(err);
  }
};

export const getCollectionBySlugOrCode = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const userId = req.user?._id;

    let query = {
      $or: [{ shareCode: identifier }, { slug: identifier.toLowerCase() }]
    };

    const collection = await SmartCollection.findOne(query)
      .populate('owner', 'name avatar')
      .populate({
        path: 'products',
        populate: { path: 'brand', select: 'name' }
      });

    if (!collection) {
      return errorResponse(res, 404, 'Collection not found');
    }

    // If private, only owner can view
    if (collection.visibility === 'private') {
      if (!userId || collection.owner._id.toString() !== userId.toString()) {
        return errorResponse(res, 403, 'This collection is private.');
      }
    }

    return successResponse(res, 200, 'Collection details retrieved', { collection });
  } catch (err) {
    next(err);
  }
};

export const addProductToCollection = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { productId } = req.body;

    const collection = await SmartCollection.findOne({ _id: id, owner: userId });
    if (!collection) {
      return errorResponse(res, 404, 'Collection not found or unauthorized');
    }

    if (!collection.products.includes(productId)) {
      collection.products.push(productId);
      await collection.save();
    }

    return successResponse(res, 200, 'Product added to collection', { collection });
  } catch (err) {
    next(err);
  }
};

export const removeProductFromCollection = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id, productId } = req.params;

    const collection = await SmartCollection.findOne({ _id: id, owner: userId });
    if (!collection) {
      return errorResponse(res, 404, 'Collection not found or unauthorized');
    }

    collection.products.pull(productId);
    await collection.save();

    return successResponse(res, 200, 'Product removed from collection', { collection });
  } catch (err) {
    next(err);
  }
};

export const deleteCollection = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const collection = await SmartCollection.findOneAndDelete({ _id: id, owner: userId });
    if (!collection) {
      return errorResponse(res, 404, 'Collection not found or unauthorized');
    }

    return successResponse(res, 200, 'Collection deleted successfully');
  } catch (err) {
    next(err);
  }
};
