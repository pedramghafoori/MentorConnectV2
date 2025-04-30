import { Router } from 'express';
import { getCertifications } from './lssController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// POST /api/lss/certifications
router.post('/certifications', authenticateToken, getCertifications);

export default router; 