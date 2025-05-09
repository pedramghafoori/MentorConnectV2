import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  title: string;
  body: string;
  slug: string;
  authorId: mongoose.Types.ObjectId;
  score: number;
  answersCount: number;
  acceptedAnswerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 300
  },
  body: {
    type: String,
    required: true,
    trim: true,
    minlength: 30,
    // Allow HTML content
    validate: {
      validator: function(v: string) {
        // Remove HTML tags for length validation
        const plainText = v.replace(/<[^>]*>/g, '');
        return plainText.length >= 30;
      },
      message: 'Question body must be at least 30 characters long (excluding HTML tags)'
    }
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
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
  answersCount: {
    type: Number,
    default: 0
  },
  acceptedAnswerId: {
    type: Schema.Types.ObjectId,
    ref: 'Answer'
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
QuestionSchema.index({ slug: 1 });
QuestionSchema.index({ authorId: 1 });
QuestionSchema.index({ score: -1 });
QuestionSchema.index({ createdAt: -1 });

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema); 