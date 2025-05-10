import { Router } from 'express';
import { AssignmentService } from '../services/assignment.service.js';
import { authenticateToken } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';
import { z } from 'zod';

const router = Router();

// Create assignment
router.post(
  '/',
  authenticateToken,
  validateRequest(z.object({
    opportunityId: z.string(),
    feeSnapshot: z.number(),
    prerequisites: z.object({
      verified: z.boolean(),
      method: z.enum(['scraper', 'ama']),
      verifiedAt: z.date().optional(),
      signedAt: z.date().optional()
    }),
    agreements: z.object({
      menteeSignature: z.string(),
      amaSignature: z.string().optional()
    }),
    paymentIntentId: z.string().optional()
  })),
  async (req, res) => {
    try {
      if (!req.user?.userId) {
        throw new Error('User not authenticated');
      }

      const assignment = await AssignmentService.createAssignment({
        menteeId: req.user.userId,
        ...req.body
      });
      res.status(201).json(assignment);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create assignment' });
    }
  }
);

// Accept assignment
router.post(
  '/:id/accept',
  authenticateToken,
  async (req, res) => {
    try {
      const assignment = await AssignmentService.acceptAssignment(req.params.id);
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: 'Error accepting assignment', error });
    }
  }
);

// Reject assignment
router.post(
  '/:id/reject',
  authenticateToken,
  async (req, res) => {
    try {
      const assignment = await AssignmentService.rejectAssignment(req.params.id);
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: 'Error rejecting assignment', error });
    }
  }
);

// Cancel assignment
router.post(
  '/:id/cancel',
  authenticateToken,
  async (req, res) => {
    try {
      const assignment = await AssignmentService.cancelAssignment(req.params.id);
      res.json(assignment);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to cancel assignment' });
    }
  }
);

export default router; 