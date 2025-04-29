import { Router } from 'express';

const router = Router();

// Get mentor profile
router.get('/profile', (req, res) => {
  res.json({ message: 'Mentor profile endpoint' });
});

// Update mentor profile
router.put('/profile', (req, res) => {
  res.json({ message: 'Update mentor profile endpoint' });
});

// Get mentor's mentees
router.get('/mentees', (req, res) => {
  res.json({ message: 'Get mentor mentees endpoint' });
});

export default router; 