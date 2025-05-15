import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';
import { z } from 'zod';
import { Assignment } from '../models/assignment.js';
import { AssignmentMessage } from '../models/assignmentMessage.js';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role?: string;
  };
  assignment?: any;
}

const router = Router();

// Helper function to check if user has access to an assignment
const checkAssignmentAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Allow access if user is mentor, mentee, or admin
    if (
      assignment.mentorId.toString() === req.user.userId ||
      assignment.menteeId.toString() === req.user.userId ||
      req.user.role === 'ADMIN'
    ) {
      req.assignment = assignment;
      next();
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error checking assignment access' });
  }
};

// Get assignment details with collaboration data
router.get(
  '/:id',
  authenticateToken,
  checkAssignmentAccess,
  async (req, res) => {
    try {
      const assignment = await Assignment.findById(req.params.id)
        .populate('menteeId', 'firstName lastName avatarUrl')
        .populate('mentorId', 'firstName lastName avatarUrl');
      
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching assignment' });
    }
  }
);

// Update lesson plan
router.post(
  '/:id/lesson-plan',
  authenticateToken,
  checkAssignmentAccess,
  validateRequest(z.object({
    driveFileId: z.string(),
    notes: z.string().optional()
  })),
  async (req, res) => {
    try {
      const assignment = await Assignment.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            'collaboration.lessonPlanReview.driveFileId': req.body.driveFileId,
            'collaboration.lessonPlanReview.notes': req.body.notes,
            'collaboration.lessonPlanReview.lastUpdatedAt': new Date()
          }
        },
        { new: true }
      );
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: 'Error updating lesson plan' });
    }
  }
);

// Update exam plan
router.post(
  '/:id/exam-plan',
  authenticateToken,
  checkAssignmentAccess,
  validateRequest(z.object({
    driveFileId: z.string(),
    notes: z.string().optional()
  })),
  async (req, res) => {
    try {
      const assignment = await Assignment.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            'collaboration.examPlanReview.driveFileId': req.body.driveFileId,
            'collaboration.examPlanReview.notes': req.body.notes,
            'collaboration.examPlanReview.lastUpdatedAt': new Date()
          }
        },
        { new: true }
      );
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: 'Error updating exam plan' });
    }
  }
);

// Update day-of preparation
router.post(
  '/:id/day-of-prep',
  authenticateToken,
  checkAssignmentAccess,
  validateRequest(z.object({
    driveFileId: z.string(),
    notes: z.string().optional()
  })),
  async (req, res) => {
    try {
      const assignment = await Assignment.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            'collaboration.dayOfPreparation.driveFileId': req.body.driveFileId,
            'collaboration.dayOfPreparation.notes': req.body.notes,
            'collaboration.dayOfPreparation.lastUpdatedAt': new Date()
          }
        },
        { new: true }
      );
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: 'Error updating day-of preparation' });
    }
  }
);

// Mark task as completed
router.patch(
  '/:id/:taskType/status',
  authenticateToken,
  checkAssignmentAccess,
  validateRequest(z.object({
    completed: z.boolean()
  })),
  async (req, res) => {
    try {
      const { taskType } = req.params;
      const validTaskTypes = ['lesson-plan', 'exam-plan', 'day-of-prep'];
      
      if (!validTaskTypes.includes(taskType)) {
        return res.status(400).json({ message: 'Invalid task type' });
      }

      const taskField = taskType === 'day-of-prep' ? 'dayOfPreparation' : 
                       taskType === 'exam-plan' ? 'examPlanReview' : 'lessonPlanReview';

      const assignment = await Assignment.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            [`collaboration.${taskField}.completed`]: req.body.completed,
            [`collaboration.${taskField}.lastUpdatedAt`]: new Date()
          }
        },
        { new: true }
      );
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: 'Error updating task status' });
    }
  }
);

// Send a message
router.post(
  '/:id/messages',
  authenticateToken,
  checkAssignmentAccess,
  validateRequest(z.object({
    message: z.string().min(1),
    driveFileId: z.string().optional(),
    fileName: z.string().optional(),
    fileType: z.string().optional(),
    fileSize: z.number().optional()
  })),
  async (req, res) => {
    try {
      const message = new AssignmentMessage({
        assignmentId: req.params.id,
        senderId: req.user.userId,
        ...req.body
      });
      await message.save();

      // TODO: Emit socket event for real-time updates
      // socket.emit('newMessage', message);

      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: 'Error sending message' });
    }
  }
);

// Get messages
router.get(
  '/:id/messages',
  authenticateToken,
  checkAssignmentAccess,
  async (req, res) => {
    try {
      const messages = await AssignmentMessage.find({ assignmentId: req.params.id })
        .populate('senderId', 'firstName lastName avatarUrl')
        .sort({ createdAt: 1 });
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching messages' });
    }
  }
);

export default router; 