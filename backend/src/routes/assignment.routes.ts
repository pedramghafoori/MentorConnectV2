import { Router } from 'express';
import { AssignmentService } from '../services/assignment.service.js';
import { authenticateToken } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';
import { z } from 'zod';
import { Assignment } from '../models/assignment.js';

const router = Router();

// Create assignment
router.post(
  '/',
  authenticateToken,
  validateRequest(z.object({
    opportunityId: z.string(),
    feeSnapshot: z.number(),
    startDate: z.string().datetime().transform(str => new Date(str)),
    prerequisites: z.object({
      verified: z.boolean(),
      method: z.enum(['scraper', 'ama']),
      verifiedAt: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined),
      signedAt: z.string().datetime().optional().transform(str => str ? new Date(str) : undefined)
    }),
    agreements: z.object({
      menteeSignature: z.string(),
      amaSignature: z.string().nullable().optional()
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

// Get assignments filtered by opportunityId and/or menteeId
router.get(
  '/',
  authenticateToken,
  async (req, res) => {
    try {
      const { opportunityId, menteeId } = req.query;
      const filter: any = {};
      if (opportunityId) filter['opportunityId'] = opportunityId;
      if (menteeId) filter['menteeId'] = menteeId;
      const assignments = await Assignment.find(filter);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  }
);

// Get mentor assignments
router.get(
  '/mentor',
  authenticateToken,
  async (req, res) => {
    try {
      console.log('GET /assignments/mentor called with:', {
        range: req.query.range,
        mentorId: req.user?.userId
      });

      const { range } = req.query;
      const mentorId = req.user?.userId;

      if (!mentorId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);

      const filter: any = { mentorId };
      switch (range) {
        case 'future':
          filter.startDate = { $gt: nextMonth };
          break;
        case 'active':
          filter.status = { $in: ['ACTIVE', 'CHARGED'] };
          break;
        case 'completed':
          filter.status = 'COMPLETED';
          break;
        default:
          filter.status = { $ne: 'COMPLETED' };
      }

      console.log('MongoDB filter:', filter);

      const assignments = await Assignment
        .find(filter)
        .populate('menteeId', 'firstName lastName avatarUrl')
        .sort({ startDate: 1 });

      console.log('Found assignments:', assignments.length);

      res.json(assignments);
    } catch (error) {
      console.error('Error in GET /assignments/mentor:', error);
      res.status(500).json({ message: 'Error fetching assignments' });
    }
  }
);

// Get mentee assignments
router.get(
  '/mentee',
  authenticateToken,
  async (req, res) => {
    try {
      console.log('=== GET /assignments/mentee ===');
      console.log('Request details:', {
        range: req.query.range,
        menteeId: req.user?.userId,
        user: req.user,
        headers: req.headers,
        cookies: req.cookies
      });

      const { range } = req.query;
      const menteeId = req.user?.userId;

      if (!menteeId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Debug: Check all assignments for this mentee
      const allAssignments = await Assignment.find({ menteeId });
      console.log('Debug - All assignments for mentee:', {
        total: allAssignments.length,
        assignments: allAssignments.map(a => ({
          id: a._id,
          status: a.status,
          startDate: a.startDate,
          mentorId: a.mentorId
        }))
      });

      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);

      console.log('Date ranges:', {
        today: today.toISOString(),
        nextMonth: nextMonth.toISOString()
      });

      const filter: any = { menteeId };
      console.log('Initial filter:', filter);

      switch (range) {
        case 'future':
          filter.startDate = { $gt: nextMonth };
          console.log('Future filter applied:', filter);
          break;
        case 'active':
          filter.status = { $in: ['ACTIVE', 'CHARGED', 'PENDING', 'ACCEPTED'] };
          console.log('Active filter applied:', filter);
          break;
        case 'completed':
          filter.status = { $in: ['COMPLETED', 'REJECTED', 'CANCELED'] };
          console.log('Completed filter applied:', filter);
          break;
        default:
          filter.status = { $nin: ['COMPLETED', 'REJECTED', 'CANCELED'] };
          console.log('Default filter applied:', filter);
      }

      console.log('Final MongoDB filter:', JSON.stringify(filter, null, 2));

      const assignments = await Assignment
        .find(filter)
        .populate('mentorId', 'firstName lastName avatarUrl')
        .sort({ startDate: 1 });

      console.log('Query results:', {
        totalFound: assignments.length,
        assignments: assignments.map(a => ({
          id: a._id,
          status: a.status,
          startDate: a.startDate,
          mentorId: a.mentorId
        }))
      });

      res.json(assignments);
    } catch (error: any) {
      console.error('Error in GET /assignments/mentee:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Error fetching assignments' });
    }
  }
);

export default router; 