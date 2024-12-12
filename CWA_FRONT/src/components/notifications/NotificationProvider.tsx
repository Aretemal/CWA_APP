import React, { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import { useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { getUserData } from '../../redux/slices/user/userSelectors';
import { getAuthToken } from '../../redux/slices/auth/authSelectors';
import type { UserNotification } from '../../types/notifications';

const SOCKET_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3002';

interface Props {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<Props> = ({ children }) => {
  const queryClient = useQueryClient();
  const userData = useSelector(getUserData);
  const token = useSelector(getAuthToken);
  const socketRef = useRef<Socket | null>(null);

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
      });

      socketRef.current.on('notification.created', (data: UserNotification) => {
        if (!data || !data.notification) {
          console.error('Invalid notification data:', data);
          return;
        }

        notification.info({
          message: data.notification.title,
          description: data.notification.description,
          placement: 'topRight',
          duration: 5,
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
          socketRef.current = null;
        }
      };
    } catch (error) {
      console.error('Socket.IO initialization error:', error);
    }
  }, [userData, token, queryClient]);

  return <>{children}</>;
}; 