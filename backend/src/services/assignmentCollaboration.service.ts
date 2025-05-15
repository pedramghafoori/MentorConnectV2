import { Assignment, IAssignment } from '../models/assignment.js';
import { AssignmentMessage } from '../models/assignmentMessage.js';
import { io } from '../server.js';

type CollaborationSection = 'lessonPlanReview' | 'examPlanReview' | 'dayOfPreparation';

interface CollaborationTask {
  driveFileId?: string;
  webViewLink?: string;
  notes?: string;
  completed: boolean;
  lastUpdatedAt?: Date;
}

export class AssignmentCollaborationService {
  // Get assignment details with populated fields
  static async getAssignmentDetails(assignmentId: string) {
    return Assignment.findById(assignmentId)
      .populate('mentorId', 'firstName lastName email')
      .populate('menteeId', 'firstName lastName email')
      .populate('opportunityId');
  }

  // Get messages for an assignment
  static async getMessages(assignmentId: string) {
    return AssignmentMessage.find({ assignmentId })
      .populate('senderId', 'firstName lastName role')
      .sort({ createdAt: 1 });
  }

  // Send a message
  static async sendMessage(assignmentId: string, senderId: string, message: string) {
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

    return populatedMessage;
  }

  // Update assignment file
  static async updateFile(
    assignmentId: string,
    section: CollaborationSection,
    driveFileId: string,
    webViewLink: string
  ) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Update the file information
    const updatedTask = {
      ...assignment[section],
      driveFileId,
      webViewLink,
      lastUpdatedAt: new Date()
    };

    assignment[section] = updatedTask;
    await assignment.save();

    // Emit socket event for real-time updates
    io.to(assignmentId).emit('collaboration:update', {
      section,
      driveFileId,
      webViewLink
    });

    return assignment;
  }

  // Update task status
  static async updateTaskStatus(
    assignmentId: string,
    taskType: CollaborationSection,
    completed: boolean,
    userId: string
  ) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Update the task status
    const updatedTask = {
      ...assignment[taskType],
      completed,
      lastUpdatedAt: new Date()
    };

    assignment[taskType] = updatedTask;
    await assignment.save();

    // Emit socket event for real-time updates
    io.to(assignmentId).emit('collaboration:update', {
      taskType,
      completed,
      updatedBy: userId
    });

    return assignment;
  }
} 