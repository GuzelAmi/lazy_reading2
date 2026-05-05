import api from './api';
import type { DictionaryResponse } from '../types';

export const dictionaryService = {
  getDefinition: async (word: string): Promise<DictionaryResponse> => {
    const response = await api.get(`/api/dictionary/${encodeURIComponent(word)}`);
    return response.data;
  }
};