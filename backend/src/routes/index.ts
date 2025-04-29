import { Router } from 'express';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Add your routes here
// router.use('/auth', authRoutes);
// router.use('/mentor', mentorRoutes);
// router.use('/mentee', menteeRoutes);

export default router; 