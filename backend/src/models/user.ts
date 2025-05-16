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
  isDummy?: boolean;
  dummyBatch?: string;
  cancellationPolicyHours?: number;
  languages?: string[];
  workplaces?: string[];
  collectsHST?: boolean;
  taxId?: string;
  allowFeatured?: boolean;
  allowSearch?: boolean;
  deletedAt?: Date | null;
  deletionRequestedAt?: Date | null;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  avatarCrop: {
    offset: {
      x: number;
      y: number;
    };
    scale: number;
    rotate: number;
  };
  mentorAgreementSigned: boolean;
  hasExaminerCourse?: boolean;
  hasTrainerCourse?: boolean;
  stripeAccountId?: string;
  googleDrive?: {
    refreshToken: string;
    accessToken: string;
    accessTokenExpiry: Date;
    driveFolderId: string;
    connectedAt: Date;
    googleAccountId: string;
    googleAccountEmail: string;
  };
}

const certificationSchema = new Schema({
  type: { type: String, required: true },
  years: { type: Number, required: true }
}, { _id: false });

const ALLOWED_PREP_REQUIREMENTS = [
  'lesson-plan',
  'exam-plan',
  'scenarios',
  'must-sees',
];

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
  },
  cancellationPolicyHours: {
    type: Number,
    default: 48,
    min: 1,
    max: 168
  },
  languages: {
    type: [String],
    default: []
  },
  workplaces: {
    type: [String],
    default: []
  },
  collectsHST: {
    type: Boolean,
    default: false
  },
  taxId: {
    type: String,
    trim: true
  },
  allowFeatured: {
    type: Boolean,
    default: true
  },
  allowSearch: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletionRequestedAt: {
    type: Date,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: undefined
  },
  resetPasswordExpires: {
    type: Date,
    default: undefined
  },
  avatarCrop: {
    offset: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 }
    },
    scale: { type: Number, default: 1 },
    rotate: { type: Number, default: 0 }
  },
  mentorAgreementSigned: {
    type: Boolean,
    default: false
  },
  hasExaminerCourse: { type: Boolean, default: false },
  hasTrainerCourse: { type: Boolean, default: false },
  stripeAccountId: {
    type: String,
    required: false,
  },
  googleDrive: {
    refreshToken: { type: String },
    accessToken: { type: String },
    accessTokenExpiry: { type: Date },
    driveFolderId: { type: String },
    connectedAt: { type: Date },
    googleAccountId: { type: String },
    googleAccountEmail: { type: String }
  }
}, {
  timestamps: true
});

// Add pre-save hook for tax validation
userSchema.pre('save', function(next) {
  if (this.collectsHST && (!this.taxId || this.taxId.length === 0)) {
    next(new Error('Tax ID is required when collecting HST'));
  } else {
    next();
  }
});

export const User = mongoose.model<IUser>('User', userSchema); 