// ============================================
// AUTH SERVICE
// ============================================
// API Calls für Authentifizierung

import apiClient from './api';
import { LoginCredentials, RegisterCredentials, ApiResponse, User } from '../types';

// Response Type für Login/Register
interface AuthResponse {
  token: string;
  user: User;
}

/**
 * User registrieren
 */
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    '/auth/register',
    credentials
  );
  
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Registrierung fehlgeschlagen');
  }
  
  return response.data.data;
};

/**
 * User einloggen
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    '/auth/login',
    credentials
  );
  
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Login fehlgeschlagen');
  }
  
  return response.data.data;
};

/**
 * Aktuellen User holen (mit Token)
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
  
  if (!response.data.success || !response.data.data) {
    throw new Error('User konnte nicht geladen werden');
  }
  
  return response.data.data.user;
};
