import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  mentorId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  duration: number;
  maxParticipants: number;
  location: string;
  mode: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
  schedule: {
    startDate: Date;
    endDate: Date;
    recurringDays?: string[];
    timeSlots?: {
      start: string;  // HH:mm format
      end: string;    // HH:mm format
    }[];
  };
  defaultSettings: {
    useProfileDefaults: boolean;
    customSettings?: {
      location?: string;
      price?: number;
      mode?: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
      prepSupportFee?: number;
      cancellationPolicyHours?: number;
      maxApprentices?: number;
      prepRequirements?: string[];
    };
  };
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  enrolledUsers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const timeSlotSchema = new Schema({
  start: { type: String, required: true }, // HH:mm format
  end: { type: String, required: true }    // HH:mm format
}, { _id: false });

const scheduleSchema = new Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  recurringDays: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
  timeSlots: [timeSlotSchema]
}, { _id: false });

const customSettingsSchema = new Schema({
  location: String,
  price: Number,
  mode: { type: String, enum: ['ONLINE', 'IN_PERSON', 'HYBRID'] },
  prepSupportFee: Number,
  cancellationPolicyHours: { type: Number, min: 1, max: 168 },
  maxApprentices: { type: Number, min: 1, max: 10 },
  prepRequirements: [{
    type: String,
    enum: ['lesson-plan', 'exam-plan', 'scenarios', 'must-sees']
  }]
}, { _id: false });

const defaultSettingsSchema = new Schema({
  useProfileDefaults: { type: Boolean, default: true },
  customSettings: customSettingsSchema
}, { _id: false });

const courseSchema = new Schema<ICourse>({
  mentorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    validate: {
      validator: async function(mentorId: mongoose.Types.ObjectId) {
        const user = await mongoose.model('User').findById(mentorId);
        return user?.role === 'MENTOR';
      },
      message: 'Course can only be created by a mentor'
    }
  },
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, min: 1 }, // in minutes
  maxParticipants: { type: Number, required: true, min: 1 },
  location: { type: String },
  mode: { 
    type: String, 
    enum: ['ONLINE', 'IN_PERSON', 'HYBRID']
  },
  schedule: { 
    type: scheduleSchema,
    required: true,
    validate: {
      validator: function(schedule: any) {
        return schedule.startDate <= schedule.endDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  defaultSettings: {
    type: defaultSettingsSchema,
    required: true
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  enrolledUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for efficient queries
courseSchema.index({ mentorId: 1, status: 1 });
courseSchema.index({ status: 1, startDate: 1 });

// Middleware to ensure enrolled users don't exceed maxParticipants
courseSchema.pre('save', function(next) {
  if (this.enrolledUsers.length > this.maxParticipants) {
    next(new Error('Cannot exceed maximum number of participants'));
  } else {
    next();
  }
});

export const Course = mongoose.model<ICourse>('Course', courseSchema); 