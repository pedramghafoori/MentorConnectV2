import { User } from './user.js';
import { Opportunity } from './opportunity.js';

export interface AssignmentCollaboration {
  lessonPlanReview: {
    driveFileId?: string;
    notes?: string;
    completed: boolean;
    lastUpdatedAt?: string;
  };
  examPlanReview: {
    driveFileId?: string;
    notes?: string;
    completed: boolean;
    lastUpdatedAt?: string;
  };
  dayOfPreparation: {
    driveFileId?: string;
    notes?: string;
    completed: boolean;
    lastUpdatedAt?: string;
  };
}

export interface Assignment {
  _id: string;
  menteeId: User;
  opportunityId: Opportunity;
  mentorId: User;
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
  collaboration: AssignmentCollaboration;
} 