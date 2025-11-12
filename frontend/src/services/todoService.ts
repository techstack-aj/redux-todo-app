// ============================================
// TODO SERVICE
// ============================================
// API Calls für Todo CRUD Operations

import apiClient from './api';
import { Todo, ApiResponse } from '../types';

/**
 * Alle Todos holen
 */
export const fetchTodos = async (): Promise<Todo[]> => {
  const response = await apiClient.get<ApiResponse<{ todos: Todo[] }>>('/todos');
  
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Todos konnten nicht geladen werden');
  }
  
  return response.data.data.todos;
};

/**
 * Neues Todo erstellen
 */
export const createTodo = async (text: string): Promise<Todo> => {
  const response = await apiClient.post<ApiResponse<{ todo: Todo }>>('/todos', { text });
  
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Todo konnte nicht erstellt werden');
  }
  
  return response.data.data.todo;
};

/**
 * Todo aktualisieren
 */
export const updateTodo = async (
  id: string,
  updates: { text?: string; completed?: boolean }
): Promise<Todo> => {
  const response = await apiClient.put<ApiResponse<{ todo: Todo }>>(`/todos/${id}`, updates);
  
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Todo konnte nicht aktualisiert werden');
  }
  
  return response.data.data.todo;
};

/**
 * Todo löschen
 */
export const deleteTodo = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse>(`/todos/${id}`);
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'Todo konnte nicht gelöscht werden');
  }
};

/**
 * Todo Status togglen
 */
export const toggleTodo = async (id: string): Promise<Todo> => {
  const response = await apiClient.patch<ApiResponse<{ todo: Todo }>>(`/todos/${id}/toggle`);
  
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Todo-Status konnte nicht geändert werden');
  }
  
  return response.data.data.todo;
};
