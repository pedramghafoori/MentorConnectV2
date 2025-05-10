import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'MENTEE_APPLICATION' | 'APPLICATION_ACCEPTED' | 'APPLICATION_REJECTED' | 'APPLICATION_CANCELED';
  data: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['MENTEE_APPLICATION', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'APPLICATION_CANCELED']
  },
  data: { type: Schema.Types.Mixed, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema); 