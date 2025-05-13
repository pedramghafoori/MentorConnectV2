import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { listMentorAssignments, getAssignmentById } from '../controllers/assignmentController.js';

const router = express.Router();

// Mentor-scoped routes
router.get('/mentor', authenticateToken, listMentorAssignments);
router.get('/:id', authenticateToken, getAssignmentById);

export default router; 