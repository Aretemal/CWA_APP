export const API_BASE_URL = 'http://localhost:3002';

export const API_PATHS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    CHANGE_ROLE: '/auth/change-role',
  },
  BOOKS: {
    BASE: '/books',
    ALL: '/books/all',
    READ: (id: string) => `/books/read/${id}`,
    BY_ID: (id: number | string) => `/books/${id}`,
    BOOKMARKS: (bookId: number) => `/books/${bookId}/bookmarks`,
  },
  BOOKMARKS: {
    BASE: '/bookmarks',
  },
  GENRES: {
    BASE: '/genres',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    MY: '/notifications/my',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_AS_READ: (id: number) => `/notifications/${id}/mark-as-read`,
  },
  USERS: {
    PROFILE: '/users/profile',
  },
} as const; 