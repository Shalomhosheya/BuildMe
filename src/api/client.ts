const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export function getToken(): string | null {
  return localStorage.getItem('buildme_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // 🔐 Handle auth failure
  if (res.status === 401) {
    localStorage.removeItem('buildme_token');
    localStorage.removeItem('buildme_user');
    window.location.href = '/login';
    throw new Error('Session expired — please log in again');
  }

  // 🔥 SAFE parsing (this fixes your crash)
  let data: any = null;
  const text = await res.text();

  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    console.error('Invalid JSON response:', text);
    throw new Error('Server returned invalid JSON');
  }

  // ❗ Handle errors AFTER parsing safely
  if (!res.ok) {
    throw new Error(data?.message || `Request failed: ${res.status}`);
  }

  return data as T;
}


export const api = {
  get:    <T>(path: string)                    => request<T>(path),
  post:   <T>(path: string, body: unknown)     => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)     => request<T>(path, { method: 'PUT',   body: JSON.stringify(body) }),
  delete: <T>(path: string)                    => request<T>(path, { method: 'DELETE' }),
};