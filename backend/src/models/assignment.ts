import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  menteeId: mongoose.Types.ObjectId;
  opportunityId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  feeSnapshot: number;
  startDate: Date;
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
  status: 'PENDING' | 'ACCEPTED' | 'ACTIVE' | 'COMPLETED' | 'REJECTED' | 'CANCELED' | 'CHARGED';
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>({
  menteeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  feeSnapshot: { type: Number, required: true },
  startDate: { type: Date, required: true },
  prerequisites: {
    verified: { type: Boolean, required: true },
    method: { type: String, enum: ['scraper', 'ama'], required: true },
    verifiedAt: { type: Date },
    signedAt: { type: Date }
  },
  agreements: {
    menteeSignature: { type: String, required: true },
    amaSignature: { type: String }
  },
  paymentIntentId: { type: String },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'ACTIVE', 'COMPLETED', 'REJECTED', 'CANCELED', 'CHARGED'],
    default: 'PENDING'
  }
}, { timestamps: true });

// Indexes for efficient querying
assignmentSchema.index({ menteeId: 1, opportunityId: 1 }, { unique: true });
assignmentSchema.index({ mentorId: 1, status: 1 });
assignmentSchema.index({ status: 1 });
assignmentSchema.index({ paymentIntentId: 1 });
assignmentSchema.index({ startDate: 1 });

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema); 