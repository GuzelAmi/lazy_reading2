// src/types/index.ts
export type ViewState = 'HOME' | 'SESSION';

export interface Book {
  id: number;
  title: string;
  author: string | null;
}

export interface Session {
  id: number;
  name: string;
  book_id: number;
  user_id: number;
  current_position: number;
  total_sentences: number;
  book_title: string;
  book_author: string | null;
  book_cover_url?: string | null;   
}

export interface Highlight {
  id: number;
  session_id: number;
  sentence_index: number;
  text: string;
}

export interface DictionaryResponse {
  word: string;
  definition: string;
  example: string;
}

// ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 1////////////////////////////////////
export interface User {
  id: number;
  username: string;
  role: 'user' | 'admin';
}
// ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 1////////////////////////////////////