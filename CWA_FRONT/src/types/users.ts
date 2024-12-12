export interface User {
  id: number;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  books: {
    id: number;
    title: string;
  }[];
  createdAt: string;
}

export interface UpdateUserRoleDto {
  userId: number;
  role: 'USER' | 'ADMIN';
} 