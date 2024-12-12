import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { getAuthToken } from '../redux/slices/auth/authSelectors';
import type { Message } from '../types/chat';

const SOCKET_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3002';

export const useChatSocket = () => {
  const queryClient = useQueryClient();
  const token = useSelector(getAuthToken);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!token) return;

    try {
      socketRef.current = io(`${SOCKET_URL}/chat`, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
      });

      socketRef.current.on('message', ({ message }: { message: Message }) => {
        // Обновляем кеш сообщений
        queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
        // Обновляем счетчик непрочитанных
        queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
      });

      socketRef.current.on('userTyping', ({ userId, isTyping }) => {
        // Можно добавить обработку события "печатает..."
        console.log(`User ${userId} is ${isTyping ? 'typing' : 'not typing'}`);
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
  }, [token, queryClient]);

  // Функция для отправки события "печатает..."
  const emitTyping = () => {
    if (!socketRef.current) return;

    // Очищаем предыдущий таймаут
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Отправляем событие "печатает"
    socketRef.current.emit('typing', true);

    // Через 2 секунды отправляем событие "не печатает"
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing', false);
    }, 2000);
  };

  return { emitTyping };
}; 