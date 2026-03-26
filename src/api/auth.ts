import { api } from './client';

export interface AuthResponse {
  token:  string;
  userId: string;
  name:   string;
  email:  string;
}

export interface UserProfile {
  id:                 string;
  name:               string;
  email:              string;
  totalPoints:        number;
  streakDays:         number;
  estimatedBandScore: number;
  earnedBadges:       string[];
  writing:            SkillProgress;
  reading:            SkillProgress;
  listening:          SkillProgress;
  speaking:           SkillProgress;
}

export interface SkillProgress {
  name:      string;
  level:     number;
  levelName: string;
  points:    number;
  maxPoints: number;
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/register', { name, email, password }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/login', { email, password }),

  me: () =>
    api.get<UserProfile>('/api/auth/me'),
};

export function saveSession(data: AuthResponse) {
  localStorage.setItem('buildme_token', data.token);
  localStorage.setItem('buildme_user',  JSON.stringify(data));
}

export function clearSession() {
  localStorage.removeItem('buildme_token');
  localStorage.removeItem('buildme_user');
}

export function getSavedUser(): AuthResponse | null {
  const raw = localStorage.getItem('buildme_user');
  return raw ? JSON.parse(raw) : null;
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('buildme_token');
}