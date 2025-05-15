import { User } from './user.js';
import { Opportunity } from './opportunity.js';

export interface CollaborationSection {
  driveFileId?: string;
  webViewLink?: string;
  notes?: string;
  completed: boolean;
  lastUpdatedAt?: string;
}

export interface Assignment {
  _id: string;
  mentorId: User;
  menteeId: User;
  opportunityId: Opportunity;
  feeSnapshot: number;
  startDate: string;
  prerequisites: {
    verified: boolean;
    method: 'scraper' | 'ama';
    verifiedAt?: string;
    signedAt?: string;
  };
  agreements: {
    menteeSignature: string;
    amaSignature?: string;
  };
  paymentIntentId?: string;
  status: 'PENDING' | 'ACCEPTED' | 'ACTIVE' | 'COMPLETED' | 'REJECTED' | 'CANCELED' | 'CHARGED';
  createdAt: string;
  updatedAt: string;
  lessonPlanReview: CollaborationSection;
  examPlanReview: CollaborationSection;
  dayOfPreparation: CollaborationSection;
} 