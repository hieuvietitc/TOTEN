import pool from '../config/database';
import { Notification, NotificationPreference, NotificationType, NotificationChannel } from '../models/Notification';
import { v4 as uuidv4 } from 'uuid';

export class NotificationService {
  async createNotification(data: {
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    channel: NotificationChannel;
    related_id?: string;
    metadata?: Record<string, any>;
  }): Promise<Notification> {
    const query = `
      INSERT INTO notifications (id, user_id, title, message, type, channel, status, related_id, metadata, sent_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `;

    const result = await pool.query(query, [
      uuidv4(),
      data.user_id,
      data.title,
      data.message,
      data.type,
      data.channel,
      'SENT',
      data.related_id || null,
      JSON.stringify(data.metadata || {}),
    ]);

    return result.rows[0];
  }

  async getUserNotifications(userId: string, limit = 50, unreadOnly = false): Promise<Notification[]> {
    let query = `
      SELECT * FROM notifications
      WHERE user_id = $1
    `;
    const params: any[] = [userId];

    if (unreadOnly) {
      query += ` AND status = 'SENT'`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const query = `
      UPDATE notifications
      SET status = 'READ', read_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [notificationId]);
    return result.rows[0];
  }

  async markMultipleAsRead(userId: string): Promise<number> {
    const query = `
      UPDATE notifications
      SET status = 'READ', read_at = NOW()
      WHERE user_id = $1 AND status = 'SENT'
    `;

    const result = await pool.query(query, [userId]);
    return result.rowCount || 0;
  }

  async getNotificationPreference(userId: string): Promise<NotificationPreference | null> {
    const query = `
      SELECT * FROM notification_preferences
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  async createOrUpdatePreference(data: NotificationPreference): Promise<NotificationPreference> {
    const query = `
      INSERT INTO notification_preferences (user_id, push_enabled, email_enabled, sms_enabled, in_app_enabled, quiet_hours_start, quiet_hours_end)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO UPDATE
      SET push_enabled = $2, email_enabled = $3, sms_enabled = $4, in_app_enabled = $5, quiet_hours_start = $6, quiet_hours_end = $7
      RETURNING *
    `;

    const result = await pool.query(query, [
      data.user_id,
      data.push_enabled,
      data.email_enabled,
      data.sms_enabled,
      data.in_app_enabled,
      data.quiet_hours_start || null,
      data.quiet_hours_end || null,
    ]);

    return result.rows[0];
  }

  async getUnreadCount(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = $1 AND status = 'SENT'
    `;

    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count) || 0;
  }

  async broadcastNotification(
    title: string,
    message: string,
    type: NotificationType,
    targetUserIds?: string[]
  ): Promise<number> {
    let query = `
      INSERT INTO notifications (id, user_id, title, message, type, channel, status, sent_at)
    `;

    if (targetUserIds && targetUserIds.length > 0) {
      const values = targetUserIds
        .map((id, i) => `('${uuidv4()}', '${id}', '${title}', '${message}', '${type}', 'IN_APP', 'SENT', NOW())`)
        .join(',');
      query += ` VALUES ${values}`;
    } else {
      query += `
        SELECT '${uuidv4()}', id, '${title}', '${message}', '${type}', 'IN_APP', 'SENT', NOW()
        FROM users WHERE deleted_at IS NULL
      `;
    }

    const result = await pool.query(query);
    return result.rowCount || 0;
  }
}

export const notificationService = new NotificationService();
