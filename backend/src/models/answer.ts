import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer extends Document {
  questionId: mongoose.Types.ObjectId;
  body: string;
  authorId: mongoose.Types.ObjectId;
  score: number;
  createdAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  body: {
    type: String,
    required: true,
    trim: true,
    minlength: 30
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
AnswerSchema.index({ questionId: 1 });
AnswerSchema.index({ authorId: 1 });
AnswerSchema.index({ score: -1 });
AnswerSchema.index({ createdAt: -1 });

export const Answer = mongoose.model<IAnswer>('Answer', AnswerSchema); 