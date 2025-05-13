import api from '../lib/api';

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
  startDate: Date;
}

export interface Assignment {
  _id: string;
  menteeId: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  mentorId: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  startDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'ACTIVE' | 'COMPLETED' | 'REJECTED' | 'CANCELED' | 'CHARGED';
}

interface ApiError extends Error {
  response?: {
    data: any;
    status: number;
  };
}

export class AssignmentService {
  static async createAssignment(data: AssignmentData) {
    const response = await api.post('/assignments', data);
    return response.data;
  }

  static async getMentorAssignments(range: 'active' | 'future' | 'completed'): Promise<Assignment[]> {
    console.log('=== getMentorAssignments Request ===');
    console.log('Request params:', { range });
    
    try {
      const response = await api.get(`/assignments/mentor?range=${range}`);
      console.log('Response data:', response.data);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error in getMentorAssignments:', apiError);
      console.error('Error response:', apiError.response?.data);
      throw apiError;
    }
  }

  static async getMenteeAssignments(range: 'active' | 'future' | 'completed'): Promise<Assignment[]> {
    const response = await api.get(`/assignments/mentee?range=${range}`);
    return response.data;
  }

  static async acceptAssignment(assignmentId: string): Promise<Assignment> {
    const response = await api.post(`/assignments/${assignmentId}/accept`);
    return response.data;
  }

  static async rejectAssignment(assignmentId: string): Promise<Assignment> {
    const response = await api.post(`/assignments/${assignmentId}/reject`);
    return response.data;
  }

  static async cancelAssignment(assignmentId: string): Promise<Assignment> {
    const response = await api.post(`/assignments/${assignmentId}/cancel`);
    return response.data;
  }
}

export const fetchMentorAssignments = (range: string) =>
  api.get(`/assignments/mentor?range=${range}`).then(r => r.data);

export const fetchAssignmentById = (id: string) =>
  api.get(`/assignments/${id}`).then(r => r.data); 