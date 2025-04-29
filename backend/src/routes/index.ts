import { Router } from 'express';
import authRoutes from './auth.js';
import mentorRoutes from './mentor.js';
import menteeRoutes from './mentee.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes (no authentication required)
router.use('/auth', authRoutes);

// Protected routes
router.use('/mentor', authenticateToken, mentorRoutes);
router.use('/mentee', authenticateToken, menteeRoutes);

export default router; 