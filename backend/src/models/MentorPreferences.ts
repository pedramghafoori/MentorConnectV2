import { Schema, model, Types } from 'mongoose';

interface IMentorPreferences {
  mentor: Types.ObjectId;
  preferredNoticeDays: number;
  prepRequirements: string[];
  expectedMenteeInvolvement: string;
  prepSupportFee: number;
  feeCurrency: string;
  cancellationPolicyHours: number;
  maxApprentices: number;
  languages: string[];
  workplaces: string[];
  collectsHST: boolean;
  taxId: string;
  allowFeatured: boolean;
  allowSearch: boolean;
}

const mentorPreferencesSchema = new Schema<IMentorPreferences>({
  mentor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  preferredNoticeDays: {
    type: Number,
    default: 7,
    min: 1,
    max: 90
  },
  prepRequirements: {
    type: [String],
    default: []
  },
  expectedMenteeInvolvement: {
    type: String,
    enum: ['', 'full-course', 'exam-only'],
    default: ''
  },
  prepSupportFee: {
    type: Number,
    min: 0
  },
  feeCurrency: {
    type: String,
    default: 'CAD'
  },
  cancellationPolicyHours: {
    type: Number,
    min: 0
  },
  maxApprentices: {
    type: Number,
    min: 1
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
  }
}, { timestamps: true });

export const MentorPreferences = model<IMentorPreferences>('MentorPreferences', mentorPreferencesSchema); 