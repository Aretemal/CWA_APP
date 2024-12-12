import React, { createContext, useContext, useEffect } from 'react';
import { notification } from 'antd';
import { useMyNotifications } from '../api/notifications';
import type { UserNotification } from '../types/notifications';

interface NotificationContextType {
  notifications: UserNotification[];
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  isLoading: false,
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: notifications = [], isLoading } = useMyNotifications();
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    notifications.forEach((notif: UserNotification) => {
      // Проверяем viewed напрямую из UserNotification
      if (!notif.viewed) {
        api.info({
          message: notif.notification.title,
          description: notif.notification.description,
          placement: 'topRight',
        });
      }
    });
  }, [notifications, api]);

  return (
    <NotificationContext.Provider value={{ notifications, isLoading }}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext); 