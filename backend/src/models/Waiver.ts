import { Schema, model } from 'mongoose';

const waiverSchema = new Schema({
  title: { type: String, required: true },
  text: { type: String, required: true }, // full waiver body
}, { timestamps: true });

export const Waiver = model('Waiver', waiverSchema); 