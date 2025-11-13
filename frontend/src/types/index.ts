// ============================================
// TYPESCRIPT TYPES FÜR FRONTEND
// ============================================

// Todo Objekt
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// User Objekt
export interface User {
  id: string;
  username: string;
  email: string;
}

// Auth State
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  middlewareType: MiddlewareType | null;
}

// Todos State
export interface TodosState {
  items: Todo[];
  filter: TodoFilter;
  loading: boolean;
  error: string | null;
}

// Filter-Optionen
export type TodoFilter = 'all' | 'active' | 'completed';

// API Response Typen
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Login/Register Credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// Middleware Type für späteren Vergleich
export type MiddlewareType = 'thunk' | 'saga' | 'observable';
