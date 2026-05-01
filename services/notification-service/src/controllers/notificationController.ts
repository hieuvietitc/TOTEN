import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService';

export class NotificationController {
  async createNotification(req: Request, res: Response) {
    try {
      const { user_id, title, message, type, channel, related_id, metadata } = req.body;

      if (!user_id || !title || !message || !type || !channel) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const notification = await notificationService.createNotification({
        user_id,
        title,
        message,
        type,
        channel,
        related_id,
        metadata,
      });

      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create notification' });
    }
  }

  async getUserNotifications(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
      const unreadOnly = req.query.unread === 'true';

      const notifications = await notificationService.getUserNotifications(userId, limit, unreadOnly);
      const unreadCount = await notificationService.getUnreadCount(userId);

      res.json({ notifications, total: notifications.length, unreadCount });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const notification = await notificationService.markAsRead(notificationId);

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark as read' });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const count = await notificationService.markMultipleAsRead(userId);
      res.json({ message: `${count} notifications marked as read` });
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
  }

  async getPreference(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const preference = await notificationService.getNotificationPreference(userId);

      if (!preference) {
        const defaultPreference = {
          user_id: userId,
          push_enabled: true,
          email_enabled: true,
          sms_enabled: false,
          in_app_enabled: true,
        };
        const created = await notificationService.createOrUpdatePreference(defaultPreference);
        return res.json(created);
      }

      res.json(preference);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch preference' });
    }
  }

  async updatePreference(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { push_enabled, email_enabled, sms_enabled, in_app_enabled, quiet_hours_start, quiet_hours_end } = req.body;

      const preference = await notificationService.createOrUpdatePreference({
        user_id: userId,
        push_enabled: push_enabled !== undefined ? push_enabled : true,
        email_enabled: email_enabled !== undefined ? email_enabled : true,
        sms_enabled: sms_enabled !== undefined ? sms_enabled : false,
        in_app_enabled: in_app_enabled !== undefined ? in_app_enabled : true,
        quiet_hours_start,
        quiet_hours_end,
      });

      res.json(preference);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update preference' });
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const count = await notificationService.getUnreadCount(userId);
      res.json({ unread_count: count });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  }

  async broadcastNotification(req: Request, res: Response) {
    try {
      const { title, message, type, target_user_ids } = req.body;

      if (!title || !message || !type) {
        return res.status(400).json({ error: 'title, message, type required' });
      }

      const count = await notificationService.broadcastNotification(title, message, type, target_user_ids);
      res.json({ message: `Notification sent to ${count} users` });
    } catch (error) {
      res.status(500).json({ error: 'Failed to broadcast notification' });
    }
  }
}

export const notificationController = new NotificationController();
