import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../config/axios';
import { API_PATHS } from '../constants/apiPaths';
import type { Notification, UserNotification, CreateNotificationDto } from '../types/notifications';

// Получение всех уведомлений (для админа)
export const useAllNotifications = () => {
  return useQuery<UserNotification[]>({
    queryKey: ['notifications', 'all'],
    queryFn: async () => {
      const response = await axios.get(API_PATHS.NOTIFICATIONS.BASE);
      console.log('Notifications response:', response.data);
      return response.data;
    },
  });
};

// Получение уведомлений пользователя
export const useMyNotifications = () => {
  return useQuery<UserNotification[]>({
    queryKey: ['notifications', 'my'],
    queryFn: () => axios.get(API_PATHS.NOTIFICATIONS.MY).then(res => res.data),
  });
};

// Создание уведомления
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNotificationDto) =>
      axios.post(API_PATHS.NOTIFICATIONS.BASE, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

// Отметить как прочитанное
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => 
      axios.patch(API_PATHS.NOTIFICATIONS.MARK_AS_READ(id)).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Получение количества непрочитанных
export const useUnreadCount = () => {
  return useQuery<number>({
    queryKey: ['notifications', 'unread'],
    queryFn: () => axios.get(API_PATHS.NOTIFICATIONS.UNREAD_COUNT).then(res => res.data),
  });
};

// Удаление уведомления
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      axios.delete(`${API_PATHS.NOTIFICATIONS.BASE}/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}; 