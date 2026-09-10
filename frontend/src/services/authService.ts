import { apiClient } from '../api/client';
import { ActivityType, User, UserRole } from '../types/user';
import { clearTokens, getRefreshToken, setTokens } from './tokenStorage';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  name: string;
  phone?: string;
  email?: string;
  password: string;
  province: string;
  municipality: string;
  role: UserRole;
  activityType?: ActivityType;
  nif?: string;
}

export async function registerRequest(payload: RegisterPayload): Promise<User> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
  setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

// identifier: telefone (+244XXXXXXXXX) ou email — o backend procura pelos dois.
export async function loginRequest(identifier: string, password: string): Promise<User> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { identifier, password });
  setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function logoutRequest(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch {
      // ignora falhas de rede no logout — os tokens locais são sempre limpos
    }
  }
  clearTokens();
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me');
  return data;
}
