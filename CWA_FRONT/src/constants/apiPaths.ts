export const API_PATHS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  BOOKS: {
    BASE: '/books',
    BY_ID: (id: number) => `/books/${id}`,
    MY: '/books/my',
    COVER: (id: number) => `/books/${id}/cover`,
  },
  BOOKMARKS: {
    BASE: '/bookmarks',
    BY_BOOK: (bookId: number) => `/bookmarks/book/${bookId}`,
    BY_ID: (id: number) => `/bookmarks/${id}`,
    UPDATE_NOTE: (id: number) => `/bookmarks/${id}/note`,
  },
  GENRES: {
    BASE: '/genres',
    BY_ID: (id: number) => `/genres/${id}`,
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    MY: '/notifications/my',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_AS_READ: (id: number) => `/notifications/${id}/mark-as-read`,
  },
  USERS: {
    ALL: '/users',
    PROFILE: '/users/profile',
    BY_ID: (id: number) => `/users/${id}`,
    UPDATE_ROLE: '/users/role',
    STATS: '/users/stats',
  },
  NEWS: {
    BASE: '/news',
    BY_ID: (id: number) => `/news/${id}`,
  },
  SUBSCRIPTIONS: {
    BASE: '/subscriptions',
    FOLLOW: (userId: number) => `/subscriptions/${userId}`,
    UNFOLLOW: (userId: number) => `/subscriptions/${userId}`,
    FOLLOWERS: '/subscriptions/followers',
    FOLLOWING: '/subscriptions/following',
    CHECK: (userId: number) => `/subscriptions/check/${userId}`,
    SEARCH: '/subscriptions/search',
  },
  FOLDERS: {
    BASE: '/folders',
    BY_ID: (id: number) => `/folders/${id}`,
    ADD_BOOK: (folderId: number, bookId: number) => `/folders/${folderId}/books/${bookId}`,
    REMOVE_BOOK: (folderId: number, bookId: number) => `/folders/${folderId}/books/${bookId}`,
  },
  CHAT: {
    BASE: '/chat',
    MESSAGES: '/chat/messages',
    UNREAD: '/chat/unread',
    USERS: '/chat/users',
    BY_USER: (userId: number) => `/chat/messages/${userId}`,
  },
  TRANSLATE: '/translate',
} as const; 