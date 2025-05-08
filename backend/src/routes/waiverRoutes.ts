import { Router } from 'express';
import {
  signWaiver,
  getLatestWaiver,
  downloadSignedWaiverPdf,
} from '../controllers/waiverController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

console.log('=== Waiver Routes Setup ===');

// Add detailed logging middleware for all waiver routes
router.use((req, res, next) => {
  console.log('=== Waiver Route Accessed ===');
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('Headers:', req.headers);
  console.log('Cookies:', req.cookies);
  next();
});

// Temporarily remove authentication for testing
router.get('/latest', (req, res, next) => {
  console.log('=== /latest route handler called ===');
  getLatestWaiver(req, res, next);
});

router.post('/sign', authenticateToken, signWaiver);
router.get('/:id/pdf', authenticateToken, downloadSignedWaiverPdf);

console.log('Waiver routes registered successfully');

export default router; 