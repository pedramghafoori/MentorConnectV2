import mongoose, { Schema, Document } from 'mongoose';

export interface IOpportunity extends Document {
  title: string;
  notes?: string;
  city: string;
  price?: number;
  createdAt: Date;
  mentor?: mongoose.Types.ObjectId;
}

const opportunitySchema = new Schema<IOpportunity>({
  title: { type: String, required: true },
  notes: { type: String, required: false },
  city: { type: String, required: true },
  price: { type: Number, required: false },
  createdAt: { type: Date, default: Date.now },
  mentor: { type: Schema.Types.ObjectId, ref: 'User', required: false },
});

export const Opportunity = mongoose.model<IOpportunity>('Opportunity', opportunitySchema); 