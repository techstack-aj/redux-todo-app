// ============================================
// TYPEN FÜR DAS BACKEND
// ============================================

// Todo-Objekt Struktur
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// User-Objekt Struktur
export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Gehashed mit bcrypt
  createdAt: Date;
}

// JWT Payload (was im Token gespeichert wird)
export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
}

// Request mit authentifiziertem User
export interface AuthRequest extends Express.Request {
  user?: JwtPayload;
}

// API Response Strukturen
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Login/Register Request Bodies
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Todo Request Bodies
export interface CreateTodoRequest {
  text: string;
}

export interface UpdateTodoRequest {
  text?: string;
  completed?: boolean;
}
