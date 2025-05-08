import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getLatestWaiver,
  signWaiver,
  getSignedWaivers,
  downloadSignedWaiverPdf,
  verifyMentorSignature
} from '../controllers/waiverController.js';

const router = express.Router();

console.log('=== Waiver Routes Setup ===');

// Add logging middleware for all waiver routes
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Public routes
router.get('/latest', getLatestWaiver);

// Protected routes
router.post('/sign', authenticateToken, signWaiver);
router.get('/signed', authenticateToken, getSignedWaivers); // Get all signed waivers for the authenticated mentor
router.get('/verify/:mentorId', authenticateToken, verifyMentorSignature); // Verify if the mentor has signed
router.get('/:id/pdf', authenticateToken, downloadSignedWaiverPdf);

console.log('Waiver routes registered successfully');

export default router; 