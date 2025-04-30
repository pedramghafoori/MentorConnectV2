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
  city?: string;
  province?: string;
  aboutMe?: string;
  lssId?: string;
  certifications?: { type: string; years: number }[];
  connections: mongoose.Types.ObjectId[];
  connectionRequests: mongoose.Types.ObjectId[];
  showLssId?: boolean;
  showConnections?: boolean;
}

const certificationSchema = new Schema({
  type: { type: String, required: true },
  years: { type: Number, required: true }
}, { _id: false });

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
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  province: {
    type: String,
    trim: true,
    default: ''
  },
  aboutMe: {
    type: String,
    trim: true,
    default: ''
  },
  lssId: {
    type: String,
    trim: true
  },
  certifications: {
    type: [certificationSchema],
    default: []
  },
  connections: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  connectionRequests: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  showLssId: {
    type: Boolean,
    default: true
  },
  showConnections: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema); 