// frontend/src/services/sessions.ts
import api from './api';
import type { Session, Highlight } from '../types';

export const sessionsService = {
  createSession: async (bookId: number, name: string): Promise<Session> => {
    const response = await api.post('/sessions/', { name, book_id: bookId });
    return response.data;
  },
  getSessions: async (): Promise<Session[]> => {
    const response = await api.get('/sessions/');
    return response.data;
  },
  getSession: async (id: number): Promise<Session> => {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  },
  updatePosition: async (sessionId: number, position: number): Promise<void> => {
    await api.put(`/sessions/${sessionId}/position`, null, { params: { position } });
  },
  addHighlight: async (sessionId: number, data: { sentence_index: number; text: string }): Promise<Highlight> => {
    const response = await api.post(`/sessions/${sessionId}/highlights`, data);
    return response.data;
  },
  getHighlights: async (sessionId: number): Promise<Highlight[]> => {
    try {
      const response = await api.get(`/sessions/${sessionId}/highlights`);
      return response.data;
    } catch (error) {
      console.warn('Error loading highlights:', error);
      return [];
    }
  },
  // ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 1////////////////////////////////////
  deleteSession: async (sessionId: number): Promise<void> => {
    await api.delete(`/sessions/${sessionId}`);
  },
  // ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 1////////////////////////////////////
};