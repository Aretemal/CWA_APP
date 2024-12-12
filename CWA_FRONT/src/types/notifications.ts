export interface CreateNotificationDto {
  title: string;
  description: string;
  recipients: string; // 'all' или ID пользователя
}

export interface Notification {
  id: number;
  title: string;
  description: string;
  creatorId: number;
  recipients: string;
  createdAt: string;
  updatedAt: string;
  users?: {
    viewed: boolean;
  }[];
}

export interface UserNotification {
  id: number;
  userId: number;
  notificationId: number;
  viewed: boolean;
  createdAt: string;
  updatedAt: string;
  notification: Notification;
} 