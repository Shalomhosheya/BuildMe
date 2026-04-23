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

  create: (title: string, content: string, tag: string) => {
  const safeTitle = title?.trim();

  if (!safeTitle) {
    throw new Error("Title cannot be empty");
  }

  return api.post<Note>('/api/notes', {
    title: safeTitle,
    content: content || "",
    tag: tag || "general"
  });
},
  update: (id: string, title: string, content: string, tag: string) => {
  const safeTitle = title?.trim();

  if (!safeTitle) {
    throw new Error("Title cannot be empty");
  }

  return api.put<Note>(`/api/notes/${id}`, {
    title: safeTitle,
    content: content || "",
    tag: tag || "general"
  });
},
  delete: (id: string) =>
    api.delete<{ message: string }>(`/api/notes/${id}`),
  
  
};
