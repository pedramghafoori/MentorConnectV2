import api from '../lib/api';
import { Assignment } from '../models/assignment';
import { AssignmentMessage } from '../models/assignmentMessage';
import { getSocket } from '../utils/socket';

export class AssignmentCollaborationService {
  static async getAssignmentById(id: string): Promise<Assignment> {
    console.log('AssignmentCollaborationService.getAssignmentById called with ID:', id);
    try {
      const response = await api.get(`/assignments/${id}`);
      console.log('API response:', response);
      return response.data;
    } catch (error) {
      console.error('Error in getAssignmentById:', error);
      throw error;
    }
  }

  // Fetch messages for an assignment
  static async getMessages(assignmentId: string): Promise<AssignmentMessage[]> {
    const response = await api.get(`/assignments/${assignmentId}/collaboration/${assignmentId}/messages`);
    return response.data;
  }

  // Send a message
  static async sendMessage(assignmentId: string, message: string): Promise<AssignmentMessage> {
    const response = await api.post(`/assignments/${assignmentId}/collaboration/${assignmentId}/messages`, { message });
    return response.data;
  }

  // Update lesson plan
  static async updateLessonPlan(assignmentId: string, driveFileId: string, notes?: string) {
    const response = await api.put(`/assignments/${assignmentId}/lesson-plan`, {
      driveFileId,
      notes
    });
    return response.data;
  }

  // Update exam plan
  static async updateExamPlan(assignmentId: string, driveFileId: string, notes?: string) {
    const response = await api.put(`/assignments/${assignmentId}/exam-plan`, {
      driveFileId,
      notes
    });
    return response.data;
  }

  // Update day-of preparation
  static async updateDayOfPrep(assignmentId: string, driveFileId: string, notes?: string) {
    const response = await api.put(`/assignments/${assignmentId}/day-of-prep`, {
      driveFileId,
      notes
    });
    return response.data;
  }

  // Mark task as completed
  static async updateTaskStatus(
    assignmentId: string,
    taskType: string,
    completed: boolean
  ): Promise<Assignment> {
    const response = await api.put(`/assignments/${assignmentId}/tasks/${taskType}`, {
      completed
    });
    return response.data;
  }

  // Join assignment room for real-time updates
  static joinAssignmentRoom(assignmentId: string): void {
    const socket = getSocket();
    socket.emit('joinAssignment', { assignmentId });
  }

  // Leave assignment room
  static leaveAssignmentRoom(assignmentId: string): void {
    const socket = getSocket();
    socket.emit('leaveAssignment', { assignmentId });
  }

  // Send real-time message
  static sendRealtimeMessage(assignmentId: string, message: string): void {
    const socket = getSocket();
    socket.emit('chat:message', { assignmentId, message });
  }

  // Update collaboration status
  static updateCollaborationStatus(
    assignmentId: string,
    taskType: string,
    completed: boolean
  ): void {
    const socket = getSocket();
    socket.emit('collaboration:update', { assignmentId, taskType, completed });
  }

  // Update assignment file
  static async updateAssignmentFile(
    assignmentId: string,
    section: 'lessonPlanReview' | 'examPlanReview' | 'dayOfPreparation',
    driveFileId: string,
    webViewLink: string
  ): Promise<Assignment> {
    const response = await api.patch(`/assignments/${assignmentId}/files`, {
      section,
      driveFileId,
      webViewLink
    });
    return response.data;
  }

  static async getAllAssignments() {
    const response = await api.get('/assignments');
    return response.data;
  }
} 