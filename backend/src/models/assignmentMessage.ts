import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignmentMessage extends Document {
  assignmentId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  // Optional fields for file attachments
  driveFileId?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

const assignmentMessageSchema = new Schema<IAssignmentMessage>({
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
    index: true
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  // Optional file attachment fields
  driveFileId: {
    type: String,
    sparse: true
  },
  fileName: {
    type: String,
    sparse: true
  },
  fileType: {
    type: String,
    sparse: true
  },
  fileSize: {
    type: Number,
    sparse: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
assignmentMessageSchema.index({ assignmentId: 1, createdAt: -1 });
assignmentMessageSchema.index({ senderId: 1 });

export const AssignmentMessage = mongoose.model<IAssignmentMessage>('AssignmentMessage', assignmentMessageSchema); 