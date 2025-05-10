import { Notification } from '../models/notification.js';
import { User } from '../models/user.js';
import mongoose from 'mongoose';

export type NotificationType = 
  | 'MENTEE_APPLICATION'
  | 'APPLICATION_ACCEPTED'
  | 'APPLICATION_REJECTED'
  | 'APPLICATION_CANCELED';

export interface NotificationData {
  userId: string;
  type: 'MENTEE_APPLICATION' | 'APPLICATION_ACCEPTED' | 'APPLICATION_REJECTED' | 'APPLICATION_CANCELED';
  data: Record<string, any>;
}

export class NotificationService {
  static async send({ userId, type, data }: NotificationData): Promise<void> {
    try {
      await Notification.create({
        userId: new mongoose.Types.ObjectId(userId),
        type,
        data,
        read: false
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      // Don't throw the error - notifications shouldn't break the main flow
    }
  }

  static async getUnreadNotifications(userId: string) {
    return Notification.find({
      userId: new mongoose.Types.ObjectId(userId),
      read: false
    }).sort({ createdAt: -1 });
  }

  static async markAsRead(notificationId: string) {
    return Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  }

  static async markAllAsRead(userId: string) {
    return Notification.updateMany(
      {
        userId: new mongoose.Types.ObjectId(userId),
        read: false
      },
      { read: true }
    );
  }

  static async getUserNotifications(userId: string): Promise<any[]> {
    return Notification.find({ userId }).sort({ createdAt: -1 });
  }

  static async createNotification(data: {
    recipient: string;
    sender: string;
    type: 'ASSIGNMENT_REQUEST' | 'ASSIGNMENT_ACCEPTED' | 'ASSIGNMENT_REJECTED' | 'ASSIGNMENT_CANCELLED';
    message: string;
  }) {
    const notification = new Notification(data);
    await notification.save();
    return notification;
  }
} 