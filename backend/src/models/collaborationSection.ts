export type CollaborationSection = 'lessonPlanReview' | 'examPlanReview' | 'dayOfPreparation';

export interface ICollabSection {
  driveFileId?: string;
  webViewLink?: string;
  notes?: string;
  completed: boolean;
  lastUpdatedAt?: Date;
} 