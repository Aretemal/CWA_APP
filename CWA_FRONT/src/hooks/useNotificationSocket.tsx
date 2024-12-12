import React from 'react';
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notification, Button } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { getUserData } from '../redux/slices/user/userSelectors';
import { getAuthToken } from '../redux/slices/auth/authSelectors';
import { useMarkAsRead } from '../api/notifications';
import type { UserNotification } from '../types/notifications';

const SOCKET_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3002';
const [api, contextHolder] = notification.useNotification();

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const userData = useSelector(getUserData);
  const token = useSelector(getAuthToken);
  const socketRef = useRef<Socket>();
  const markAsRead = useMarkAsRead();

  useEffect(() => {
    if (!userData || !token) return;

    try {
      socketRef.current = io(`${SOCKET_URL}/notifications`, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        withCredentials: true,
      });

      socketRef.current.on('notification', (data: UserNotification) => {
        if (!data || !data.notification) {
          console.error('Invalid notification data:', data);
          return;
        }

        const key = `notification-${data.notification.id}`;

        const handleMarkAsRead = async () => {
          try {
            await markAsRead.mutateAsync(data.notification.id);
            api.destroy(key);
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
          } catch (error) {
            console.error('Error marking notification as read:', error);
          }
        };

        api.info({
          key,
          message: data.notification.title,
          description: data.notification.description,
          placement: 'topRight',
          duration: 0,
          className: 'notification-with-button',
          btn: (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={handleMarkAsRead}
            >
              Прочитано
            </Button>
          ),
        });

        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    } catch (error) {
      console.error('Socket.IO initialization error:', error);
    }
  }, [userData, token, queryClient, markAsRead]);

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
}; 