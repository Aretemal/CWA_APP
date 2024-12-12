const API_URL = 'http://localhost:3002';


export interface AllBooksResponse {
    data: BookObject[];
}

export interface BookObject {
        id: number,
        title: string,
        author: string,
        uniqueIdentifier: string
}

export const fetchAllBooks = async (credentials: { token: string }) => {
    const response = await fetch(`${API_URL}/books/all`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + credentials?.token,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Не удалось получить книги');
    }
    return response.json();
};

export const fetchBookFile = async ({ token, id }: { token: string; id: string }) => {
  const response = await fetch(`${API_URL}/books/read/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch book');
  }

  return response.json() as Promise<{
    file: string;
    title: string;
    author: string;
  }>;
};

export const deleteBook = async (token: string, id: string) => {
  const response = await fetch(`${API_URL}/books/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete book');
  }

  return response.json();
};