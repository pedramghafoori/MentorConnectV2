import { Router } from 'express';
import { CourseType } from '../models/courseType.js';

const router = Router();

// Get all course types with calculated fee ranges
router.get('/', async (req, res) => {
  try {
    const types = await CourseType.find().lean();
    // Calculate fee range for each type
    const results = await Promise.all(types.map(async (type) => {
      const range = await CourseType.calculateFeeRange(type.name);
      return {
        ...type,
        feeRange: range
      };
    }));
    res.json(results);
  } catch (error) {
    console.error('Error fetching course types:', error);
    res.status(500).json({ error: 'Failed to fetch course types' });
  }
});

export default router; 