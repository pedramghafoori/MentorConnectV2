import { Router } from 'express';
import { getCertifications } from './lssController.js';

const router = Router();

// POST /api/lss/certifications - Allow unauthenticated access for registration
router.post('/certifications', getCertifications);

export default router; 