import { Category } from '../models/Category.js';
import { Brand } from '../models/Brand.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ active: true }).sort({ name: 1 }).lean();
    return successResponse(res, 200, 'Categories retrieved', { categories });
  } catch (err) {
    next(err);
  }
};

export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug: slug.toLowerCase() }).lean();
    if (!category) {
      return errorResponse(res, 404, 'Category not found');
    }
    return successResponse(res, 200, 'Category details', { category });
  } catch (err) {
    next(err);
  }
};

export const getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find({ active: true }).sort({ name: 1 }).lean();
    return successResponse(res, 200, 'Brands retrieved', { brands });
  } catch (err) {
    next(err);
  }
};

export const getBrandBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const brand = await Brand.findOne({ slug: slug.toLowerCase() }).lean();
    if (!brand) {
      return errorResponse(res, 404, 'Brand not found');
    }
    return successResponse(res, 200, 'Brand details', { brand });
  } catch (err) {
    next(err);
  }
};
