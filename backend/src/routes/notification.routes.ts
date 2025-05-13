import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { NotificationService } from '../services/notification.service.js';

const router = Router();

// Get all notifications for the current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user?.userId) {
      throw new Error('User not authenticated');
    }

    const notifications = await NotificationService.getUserNotifications(req.user.userId);
    res.json(notifications);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to fetch notifications' });
  }
});

// Mark a notification as read
router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    if (!req.user?.userId) {
      throw new Error('User not authenticated');
    }

    const notification = await NotificationService.markAsRead(req.params.id);
    res.json(notification);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.post('/read-all', authenticateToken, async (req, res) => {
  try {
    if (!req.user?.userId) {
      throw new Error('User not authenticated');
    }

    await NotificationService.markAllAsRead(req.user.userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to mark notifications as read' });
  }
});

export default router; 