import express from 'express';
import {
  getAllCategories,
  getCategoriesByLevel,
  getCategoriesByType,
  getCertificationHierarchy,
  getCategoryByCode
} from '../controllers/certificationCategoryController.js';

const router = express.Router();

// Get all certification categories
router.get('/', getAllCategories);

// Get certification hierarchy
router.get('/hierarchy', getCertificationHierarchy);

// Get categories by level
router.get('/level/:level', getCategoriesByLevel);

// Get categories by type
router.get('/type/:category', getCategoriesByType);

// Get category by code
router.get('/code/:code', getCategoryByCode);

export default router; 