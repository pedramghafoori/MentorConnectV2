import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  role: 'MENTOR' | 'STUDENT';
  stripeAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['MENTOR', 'STUDENT'],
    required: true,
  },
  stripeAccountId: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

// Prevent model recompilation error
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema); 