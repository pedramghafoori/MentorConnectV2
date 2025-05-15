export interface Opportunity {
  _id: string;
  title: string;
  description: string;
  mentorId: string;
  fee: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  createdAt: string;
  updatedAt: string;
} 