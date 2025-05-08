import { Schema, model, Types } from 'mongoose';

const signedWaiverSchema = new Schema({
  mentor: { type: Types.ObjectId, ref: 'User', required: true },
  waiver: { type: Types.ObjectId, ref: 'Waiver', required: true },
  waiverText: { type: String, required: true }, // Store the exact waiver text that was signed
  signaturePng: { type: String, required: true }, // "data:image/png;base64,..."
  signedAt: { type: Date, default: Date.now },
}, { timestamps: true });

signedWaiverSchema.index({ mentor: 1, waiver: 1 }, { unique: true });

export const SignedWaiver = model('SignedWaiver', signedWaiverSchema); 