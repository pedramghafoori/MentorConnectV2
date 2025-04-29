import { Router } from 'express';
import { getCertifications } from './lssController.js';

const router = Router();

// POST /api/lss/certifications
router.post('/certifications', getCertifications);

export default router; 