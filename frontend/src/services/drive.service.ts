import api from '../lib/api';
import { AssignmentCollaborationService } from './assignmentCollaboration.service';

export class DriveService {
  // Get Google Drive auth URL
  static async getAuthUrl(): Promise<string> {
    const response = await api.get('/drive/auth-url');
    return response.data.authUrl;
  }

  // Upload file to Drive and update assignment
  static async uploadFile(
    file: File,
    assignmentId: string,
    section: 'lessonPlanReview' | 'examPlanReview' | 'dayOfPreparation',
    counterpartEmail?: string
  ): Promise<{
    fileId: string;
    fileName: string;
    webViewLink: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    if (counterpartEmail) {
      formData.append('counterpartEmail', counterpartEmail);
    }

    const response = await api.post('/drive/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    const { fileId, fileName, webViewLink } = response.data;

    // Update assignment with file info
    await AssignmentCollaborationService.updateAssignmentFile(
      assignmentId,
      section,
      fileId,
      webViewLink
    );

    return { fileId, fileName, webViewLink };
  }

  // Share file with another user
  static async shareFile(
    fileId: string,
    email: string,
    role: 'reader' | 'commenter' | 'writer' = 'reader'
  ): Promise<void> {
    await api.post('/drive/share', { fileId, email, role });
  }

  // Check if user has connected Google Drive
  static async isDriveConnected(): Promise<boolean> {
    try {
      const response = await api.get('/me');
      return !!response.data.googleDrive?.refreshToken;
    } catch (error) {
      return false;
    }
  }
} 