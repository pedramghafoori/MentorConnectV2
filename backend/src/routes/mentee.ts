import { Router } from 'express';

const router = Router();

// Get mentee profile
router.get('/profile', (req, res) => {
  res.json({ message: 'Mentee profile endpoint' });
});

// Update mentee profile
router.put('/profile', (req, res) => {
  res.json({ message: 'Update mentee profile endpoint' });
});

// Get mentee's mentors
router.get('/mentors', (req, res) => {
  res.json({ message: 'Get mentee mentors endpoint' });
});

export default router; 