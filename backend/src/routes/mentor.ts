import { Router } from 'express';
import { updateNoticeDays, updatePrepRequirements, updateExpectedInvolvement, updatePrepSupportFee, updateCancellationWindow } from '../controllers/mentorPreferences.js';

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

// Update preferred notice days
router.put('/notice-days', updateNoticeDays);

// Update prep requirements
router.put('/prep-requirements', updatePrepRequirements);

// Update expected mentee involvement
router.put('/expected-involvement', updateExpectedInvolvement);

// Update prep support fee
router.put('/prep-support-fee', updatePrepSupportFee);

// Update cancellation window
router.put('/cancellation-window', updateCancellationWindow);

export default router; 