import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'MENTEE' | 'MENTOR';
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
  avatarUrl?: string;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['MENTEE', 'MENTOR'],
    default: 'MENTEE',
    required: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  avatarUrl: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema); 