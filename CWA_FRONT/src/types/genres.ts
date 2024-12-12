export interface CreateGenreDto {
  name: string;
  description?: string;
}

export interface Genre {
  id: number;
  name: string;
  books?: {
    id: number;
    title: string;
  }[];
  createdAt: string;
  updatedAt: string;
} 