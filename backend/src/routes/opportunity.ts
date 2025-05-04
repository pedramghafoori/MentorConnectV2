import { Router } from 'express';
import { Opportunity } from '../models/opportunity.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/opportunities - Get all or filter by city
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    let filter = {};
    if (city) {
      filter = { city };
    }
    const opportunities = await Opportunity.find(filter);
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching opportunities', error });
  }
});

// POST /api/opportunities - Create a new opportunity
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.user.role !== 'MENTOR') {
      return res.status(403).json({ message: 'Only mentors can post opportunities.' });
    }
    const { title, description, city, price } = req.body;
    const opportunity = new Opportunity({
      title,
      description,
      city,
      price,
      createdAt: new Date(),
      mentor: req.user.userId
    });
    await opportunity.save();
    res.status(201).json(opportunity);
  } catch (error) {
    res.status(500).json({ message: 'Error creating opportunity', error });
  }
});

export default router; 