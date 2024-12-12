import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../constants/apiUrl';
import { getAuthToken } from '../redux/slices/auth/authSelectors';
import { useSelector } from 'react-redux';
import type { Message } from '../types/chat';

export const useSocket = () => {
  const socketRef = useRef<Socket>();
  const token = useSelector(getAuthToken);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    console.log('Initializing socket connection to:', API_URL);

    if (!socketRef.current || !socketRef.current.connected) {
      socketRef.current = io(API_URL, {
        auth: { token },
        transports: ['websocket'],
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected successfully');
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setIsConnected(false);
      });

      socketRef.current.on('message', ({ message }) => {
        console.log('Received message:', message);
        setMessages((prev) => [...prev, message]);
      });
    }

    return () => {
      if (socketRef.current?.connected) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = undefined;
      }
    };
  }, [token]);

  const sendMessage = useCallback(async (content: string, chatId?: number) => {
    if (!socketRef.current?.connected) {
      console.error('Socket not connected');
      return;
    }

    if (!content.trim()) {
      return;
    }

    try {
      socketRef.current.emit('message', { content, chatId });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, []);

  const loadMessages = useCallback(async (userId?: number) => {
    if (!socketRef.current?.connected) {
      console.error('Socket not connected');
      return;
    }

    try {
      setIsLoading(true);
      setMessages([]); // Очищаем предыдущие сообщения

      return new Promise<void>((resolve) => {
        socketRef.current!.emit('loadMessages', { userId });

        socketRef.current!.once('messages', ({ messages }) => {
          setMessages(messages);
          setIsLoading(false);
          resolve();
        });
      });
    } catch (error) {
      console.error('Error loading messages:', error);
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    sendMessage,
    loadMessages,
    isConnected,
    isLoading,
  };
};

export default useSocket; 