import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface AssignmentData {
  opportunityId: string;
  feeSnapshot: number;
  prerequisites: {
    verified: boolean;
    method: 'scraper' | 'ama';
    verifiedAt?: Date;
    signedAt?: Date;
  };
  agreements: {
    menteeSignature: string;
    amaSignature?: string;
  };
  paymentIntentId?: string;
}

export class AssignmentService {
  static async createAssignment(data: AssignmentData) {
    const response = await axios.post(`${API_URL}/assignments`, data);
    return response.data;
  }

  static async acceptAssignment(assignmentId: string) {
    const response = await axios.post(`${API_URL}/assignments/${assignmentId}/accept`);
    return response.data;
  }

  static async rejectAssignment(assignmentId: string) {
    const response = await axios.post(`${API_URL}/assignments/${assignmentId}/reject`);
    return response.data;
  }

  static async cancelAssignment(assignmentId: string) {
    const response = await axios.post(`${API_URL}/assignments/${assignmentId}/cancel`);
    return response.data;
  }
} 