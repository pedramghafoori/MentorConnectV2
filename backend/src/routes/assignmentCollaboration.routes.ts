import express from 'express';
import { Assignment } from '../models/assignment.js';
import { AssignmentMessage } from '../models/assignmentMessage.js';
import { checkAssignmentAccess } from '../middleware/assignmentAccess.js';
import { io } from '../server.js';
import { Router } from 'express';
import { AssignmentCollaborationService } from '../services/assignmentCollaboration.service.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

type CollaborationSection = 'lessonPlanReview' | 'examPlanReview' | 'dayOfPreparation';

// Helper function to check if user has access to assignment
const hasAssignmentAccess = async (userId: string, assignmentId: string, isAdmin: boolean = false) => {
  if (isAdmin) return true;
  
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return false;
  
  return assignment.mentorId.toString() === userId || assignment.menteeId.toString() === userId;
};

// Get assignment details
router.get('/:id', checkAssignmentAccess, async (req, res) => {
  try {
    const assignment = await AssignmentCollaborationService.getAssignmentDetails(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Error fetching assignment' });
  }
});

// Get messages for an assignment
router.get('/:id/messages', checkAssignmentAccess, async (req, res) => {
  try {
    const messages = await AssignmentCollaborationService.getMessages(req.params.id);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send a message
router.post('/:id/messages', checkAssignmentAccess, async (req, res) => {
  try {
    const { message } = req.body;
    const assignmentId = req.params.id;
    const senderId = req.user?.userId;

    if (!senderId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const newMessage = await AssignmentCollaborationService.sendMessage(assignmentId, senderId, message);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Update assignment file
router.patch('/:id/files', checkAssignmentAccess, async (req, res) => {
  try {
    const { section, driveFileId, webViewLink } = req.body;
    const assignmentId = req.params.id;
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user has permission to update this section
    const isMentor = assignment.mentorId.toString() === userId;
    const isMentee = assignment.menteeId.toString() === userId;
    
    if (!isAdmin && !isMentor && !isMentee) {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }

    // Validate section type
    if (!['lessonPlanReview', 'examPlanReview', 'dayOfPreparation'].includes(section)) {
      return res.status(400).json({ message: 'Invalid section type' });
    }

    const updatedAssignment = await AssignmentCollaborationService.updateFile(
      assignmentId,
      section as CollaborationSection,
      driveFileId,
      webViewLink
    );

    res.json(updatedAssignment);
  } catch (error) {
    console.error('Error updating assignment file:', error);
    res.status(500).json({ message: 'Error updating assignment file' });
  }
});

// Update task status
router.patch('/:id/tasks', checkAssignmentAccess, async (req, res) => {
  try {
    const { taskType, completed } = req.body;
    const assignmentId = req.params.id;
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user has permission to update this task
    const isMentor = assignment.mentorId.toString() === userId;
    
    if (!isAdmin && !isMentor) {
      return res.status(403).json({ message: 'Only mentors can update task status' });
    }

    // Validate task type
    if (!['lessonPlanReview', 'examPlanReview', 'dayOfPreparation'].includes(taskType)) {
      return res.status(400).json({ message: 'Invalid task type' });
    }

    const updatedAssignment = await AssignmentCollaborationService.updateTaskStatus(
      assignmentId,
      taskType as CollaborationSection,
      completed,
      userId
    );

    res.json(updatedAssignment);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Error updating task status' });
  }
});

export default router; 