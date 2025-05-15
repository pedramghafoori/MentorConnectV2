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
    const assignment = await Assignment.findById(req.params.id)
      .populate('mentorId', 'firstName lastName email')
      .populate('menteeId', 'firstName lastName email');

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
    const messages = await AssignmentMessage.find({ assignmentId: req.params.id })
      .populate('senderId', 'firstName lastName role')
      .sort({ createdAt: 1 });

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

    const newMessage = new AssignmentMessage({
      assignmentId,
      senderId,
      message
    });

    await newMessage.save();

    // Populate sender info for the socket event
    const populatedMessage = await AssignmentMessage.findById(newMessage._id)
      .populate('senderId', 'firstName lastName role');

    // Emit socket event for real-time updates
    io.to(assignmentId).emit('chat:message', populatedMessage);

    res.status(201).json(populatedMessage);
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

    // Update the file information
    const typedSection = section as CollaborationSection;
    assignment.collaboration[typedSection] = {
      ...assignment.collaboration[typedSection],
      driveFileId,
      webViewLink
    };

    await assignment.save();

    // Emit socket event for real-time updates
    io.to(assignmentId).emit('collaboration:update', {
      section,
      driveFileId,
      webViewLink,
      updatedBy: userId,
      isAdmin
    });

    res.json(assignment);
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

    // Update the task status
    const typedTaskType = taskType as CollaborationSection;
    assignment.collaboration[typedTaskType] = {
      ...assignment.collaboration[typedTaskType],
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
      completedBy: completed ? userId : undefined
    };

    await assignment.save();

    // Log admin action if applicable
    if (isAdmin) {
      console.log(`Admin ${userId} marked ${taskType} as ${completed ? 'completed' : 'incomplete'} for assignment ${assignmentId}`);
    }

    // Emit socket event for real-time updates
    io.to(assignmentId).emit('collaboration:update', {
      taskType,
      completed,
      updatedBy: userId,
      isAdmin
    });

    res.json(assignment);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Error updating task status' });
  }
});

export default router; 