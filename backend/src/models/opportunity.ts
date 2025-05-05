import mongoose, { Schema, Document } from 'mongoose';

export interface IOpportunity extends Document {
  title: string;
  notes?: string;
  city: string;
  price?: number;
  createdAt: Date;
  mentor?: mongoose.Types.ObjectId;
  mentee?: mongoose.Types.ObjectId;
  organization?: {
    name: string;
    type: string;
  };
  facility?: mongoose.Types.ObjectId;
  status?: 'draft' | 'published';
  schedule: {
    isExamOnly: boolean;
    examDate: Date;
    courseDates: Date[];
  };
  prepRequirements: string[];
  deletedAt: Date;
}

const opportunitySchema = new Schema<IOpportunity>({
  title: { type: String, required: true },
  notes: { type: String, required: false },
  city: { type: String, required: true },
  price: { type: Number, required: false },
  createdAt: { type: Date, default: Date.now },
  mentor: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  mentee: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  organization: {
    name: { type: String, required: false },
    type: { type: String, required: false }
  },
  facility: { type: Schema.Types.ObjectId, ref: 'Facility', required: false },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  schedule: {
    isExamOnly: { type: Boolean, required: false },
    examDate: { type: Date, required: false },
    courseDates: [{ type: Date, required: false }]
  },
  prepRequirements: [{ type: String, required: false }],
  deletedAt: { type: Date, default: null },
});

export const Opportunity = mongoose.model<IOpportunity>('Opportunity', opportunitySchema); 