import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  getBrands,
  getBrandBySlug
} from '../controllers/categoryBrandController.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/categories/:slug', getCategoryBySlug);
router.get('/brands', getBrands);
router.get('/brands/:slug', getBrandBySlug);

export default router;
