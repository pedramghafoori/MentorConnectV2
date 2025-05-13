import { Notification } from '../models/notification.js';
import { User } from '../models/user.js';
import mongoose from 'mongoose';
import { sendRealtimeNotification } from '../server.js';

export type NotificationType = 
  | 'MENTEE_APPLICATION'
  | 'APPLICATION_ACCEPTED'
  | 'APPLICATION_REJECTED'
  | 'APPLICATION_CANCELED'
  | 'MENTOR_APPLICATION_RECEIVED';

export interface NotificationData {
  userId: string;
  type: NotificationType;
  data: Record<string, any>;
}

export class NotificationService {
  static async send({ userId, type, data }: NotificationData): Promise<void> {
    try {
      const notification = await Notification.create({
        userId: new mongoose.Types.ObjectId(userId),
        type,
        data,
        read: false
      });
      // Emit real-time notification
      sendRealtimeNotification(userId, notification);
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
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    if (notification) {
      sendRealtimeNotification(notification.userId.toString(), notification);
    }
    return notification;
  }

  static async markAllAsRead(userId: string) {
    await Notification.updateMany(
      {
        userId: new mongoose.Types.ObjectId(userId),
        read: false
      },
      { read: true }
    );
    // Optionally, you could emit a bulk update event here if needed
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