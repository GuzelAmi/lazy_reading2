import api from './api';

export const booksService = {
  getBooks: async (params: any) => {
    const response = await api.get('/books/', { params });
    return response.data;
  },
  uploadBook: async (file: File, title: string, author?: string) => {
    const formData = new FormData();
    formData.append('book_file', file);
    formData.append('title', title);
    if (author) formData.append('author', author);
    const response = await api.post('/books/upload', formData);
    return response.data;
  },
  updateBook: async (id: number, data: { title: string; author?: string }) => {
    const response = await api.put(`/books/${id}`, data);
    return response.data;
  },
  deleteBook: async (id: number) => {
    await api.delete(`/books/${id}`);
  },
  downloadBook: async (id: number) => {
    const response = await api.get(`/books/${id}/download`);
    return response.data;
  },
  // НОВЫЙ МЕТОД
  getBookText: async (bookId: number): Promise<string> => {
    const response = await api.get(`/books/${bookId}/text`);
    return response.data;
  }
};