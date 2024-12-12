import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../config/axios';
import { API_PATHS } from '../constants/apiPaths';
import type { Message, Chat } from '../types/chat';

// Получение всех чатов (для админа)
export const useChats = () => {
  return useQuery<Chat[]>({
    queryKey: ['chats'],
    queryFn: () => axios.get(API_PATHS.CHAT.BASE).then((res) => res.data),
  });
};

// Получение сообщений чата
export const useChatMessages = (userId?: number) => {
  return useQuery<Message[]>({
    queryKey: ['chat', 'messages', userId],
    queryFn: () => 
      axios.get(userId ? API_PATHS.CHAT.BY_USER(userId) : API_PATHS.CHAT.MESSAGES)
        .then((res) => res.data),
    enabled: userId !== undefined,
  });
};

// Отправка сообщения
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content: string; chatId?: number }) =>
      axios.post(API_PATHS.CHAT.MESSAGES, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['chat'],
        refetchType: 'all',
      });
    },
  });
};

// Получение количества непрочитанных сообщений
export const useUnreadMessages = () => {
  return useQuery<number>({
    queryKey: ['chat', 'unread'],
    queryFn: () => axios.get(API_PATHS.CHAT.UNREAD).then((res) => res.data),
  });
}; 