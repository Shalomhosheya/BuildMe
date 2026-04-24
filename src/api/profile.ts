const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const profileApi = {
  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const token    = localStorage.getItem('buildme_token');
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await fetch(`${BASE_URL}/api/profile/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (res.status === 401) {
      localStorage.removeItem('buildme_token');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  },

  deleteAvatar: async (): Promise<void> => {
    const token = localStorage.getItem('buildme_token');
    const res   = await fetch(`${BASE_URL}/api/profile/avatar`, {
      method:  'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to remove photo');
  },
};

// ✅ Always build full absolute URL from whatever the backend returns
export function getAvatarUrl(avatarPath?: string | null): string | null {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath;         // already full URL
  return `${BASE_URL}${avatarPath}`;                           // e.g. /uploads/avatars/xyz.jpg → http://localhost:8080/uploads/avatars/xyz.jpg
}