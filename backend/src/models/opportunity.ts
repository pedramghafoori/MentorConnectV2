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
  opid: string;
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
  opid: { type: String, required: true, unique: true, index: true },
});

// Auto-generate opid before saving
opportunitySchema.pre('validate', async function (next) {
  if (this.isNew && !this.opid) {
    // Find the highest existing opid number
    const last = await (this.constructor as any)
      .findOne({ opid: /^OPID-\d{5}$/ })
      .sort({ opid: -1 })
      .select('opid');
    let nextNum = 1;
    if (last && last.opid) {
      const match = last.opid.match(/OPID-(\d{5})/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    this.opid = `OPID-${String(nextNum).padStart(5, '0')}`;
  }
  next();
});

export const Opportunity = mongoose.model<IOpportunity>('Opportunity', opportunitySchema); 