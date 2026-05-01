export type NotificationType = 'MATCH_INVITE' | 'BOOKING_CONFIRM' | 'RESULT_UPDATE' | 'RANKING_CHANGE' | 'TOURNAMENT_UPDATE' | 'PROMOTION' | 'SYSTEM';
export type NotificationStatus = 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
export type NotificationChannel = 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  related_id?: string;
  metadata?: Record<string, any>;
  sent_at: Date;
  read_at?: Date;
  created_at: Date;
}

export interface NotificationPreference {
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}
