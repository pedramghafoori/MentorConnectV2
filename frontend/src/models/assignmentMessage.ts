export interface AssignmentMessage {
  _id: string;
  assignmentId: string;
  senderId: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  driveFileId?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
} 