import { api } from './client';

export interface Note {
  id: string;
  title: string;
  content: string;
  tag: string;
  createdAt: string;
  updatedAt: string;
}

export const notesApi = {
  getAll: (tag?: string) =>
    api.get<Note[]>(`/api/notes${tag && tag !== 'all' ? `?tag=${tag}` : ''}`),

  create: (title: string, content: string, tag: string) =>
    api.post<Note>('/api/notes', { title, content, tag }),

  update: (id: string, title: string, content: string, tag: string) =>
    api.put<Note>(`/api/notes/${id}`, { title, content, tag }),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/api/notes/${id}`),
};