import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { CertificationCategory } from '../models/certificationCategory.js';
import {
  getAllCategories,
  getCategoriesByLevel,
  getCategoriesByType,
  getCertificationHierarchy,
  getCategoryByCode
} from '../controllers/certificationCategoryController.js';

const router = express.Router();

// Middleware to check if user is developer
const isDeveloper = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('Checking developer access for user:', req.user); // Debug log
  if (req.user?.email === 'pedramghafoori@hotmail.com') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Developer only.' });
  }
};

// Public GET routes
router.get('/', getAllCategories);
router.get('/hierarchy', getCertificationHierarchy);
router.get('/level/:level', getCategoriesByLevel);
router.get('/type/:category', getCategoriesByType);
router.get('/code/:code', getCategoryByCode);

// Protected routes (require authentication)
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const categories = await CertificationCategory.find().sort('level');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certification categories' });
  }
});

// Developer-only routes
router.put('/:id', authenticateToken, isDeveloper, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level, validAwards } = req.body;

    const category = await CertificationCategory.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    category.name = name;
    category.level = level;
    category.validAwards = validAwards;

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update certification category' });
  }
});

router.post('/', authenticateToken, isDeveloper, async (req, res) => {
  try {
    const { name, level, validAwards } = req.body;

    const category = new CertificationCategory({
      name,
      level,
      validAwards,
      code: name.toLowerCase().replace(/\s+/g, '_').toUpperCase(),
      category: level === 1 ? 'INSTRUCTOR' : level === 2 ? 'EXAMINER' : 'INSTRUCTOR_TRAINER'
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create certification category' });
  }
});

router.delete('/:id', authenticateToken, isDeveloper, async (req, res) => {
  try {
    const { id } = req.params;
    await CertificationCategory.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete certification category' });
  }
});

router.patch('/:id', authenticateToken, isDeveloper, async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    console.log('[PATCH] Updating category', id, 'with', update);
    const category = await CertificationCategory.findByIdAndUpdate(id, update, { new: true });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('[PATCH] Error updating category:', error);
    res.status(500).json({ error: 'Failed to patch certification category' });
  }
});

export default router; 