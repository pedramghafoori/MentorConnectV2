export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'MENTOR' | 'MENTEE';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
} 