import mongoose, { Schema, Document } from 'mongoose';

export interface IFacility extends Document {
  name: string;
  organization: string;
  address: string;
  city: string;
}

const facilitySchema = new Schema<IFacility>({
  name: { type: String, required: true },
  organization: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
});

export const Facility = mongoose.model<IFacility>('Facility', facilitySchema); 