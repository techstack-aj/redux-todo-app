// Todos Thunks - Redux Thunk für Todo CRUD Operations
import { Dispatch } from 'redux';
import {
  fetchTodosStart,
  fetchTodosSuccess,
  fetchTodosFailure,
  addTodo,
  updateTodo,
  removeTodo,
} from './todosSlice';
import * as todoService from '../../services/todoService';

// Thunk für Fetch Todos mit Loading-State und Error-Handling
export const fetchTodosThunk = () => {
  return async (dispatch: Dispatch) => {
    try {
        console.log('🔵 THUNK: Lade Todos...');
        dispatch(fetchTodosStart());
        const todos = await todoService.fetchTodos();
        dispatch(fetchTodosSuccess(todos));
        console.log('✅ THUNK: Todos geladen:', todos.length);
    } catch (error: any) {
        const errorMessage =
            error.response?.data?.error || error.message || 'Fehler beim Laden der Todos';
        dispatch(fetchTodosFailure(errorMessage));
        console.error('❌ THUNK: Fehler beim Laden', error);
    }
  };
};

// Thunk für Create Todo mit API-Call
export const createTodoThunk = (text: string) => {
  return async (dispatch: Dispatch) => {
    try {
        console.log('🔵 THUNK: Erstelle Todo:', text);
        const newTodo = await todoService.createTodo(text);
        dispatch(addTodo(newTodo));
        console.log('✅ THUNK: Todo erstellt:', newTodo);
    } catch (error: any) {
        console.error('❌ THUNK: Fehler beim Erstellen des Todos:', error);
    }
  };
};

// Thunk für Update Todo mit API-Call
export const updateTodoThunk = (id: string, updates: { text?: string; completed?: boolean }) => {
  return async (dispatch: Dispatch) => {
    try {
        console.log('🔵 THUNK: Aktualisiere Todo:', id, updates);
        const updatedTodo = await todoService.updateTodo(id, updates);
        dispatch(updateTodo(updatedTodo));
        console.log('✅ THUNK: Todo aktualisiert:', updatedTodo);
    } catch (error: any) {
        console.error('Fehler beim Aktualisieren des Todos:', error);
    }
  };
};

// Thunk für Delete Todo mit API-Call
/**
 * HINWEIS:
 * - Parameter: id (string)
 * - API Call: todoService.deleteTodo(id) -> kein return value
 * - Success: dispatch(removeTodo(id))
 */
export const deleteTodoThunk = (id: string) => {
  return async (dispatch: Dispatch) => {
    try {
        console.log('🔵 THUNK: Lösche Todo:', id);
        await todoService.deleteTodo(id);
        dispatch(removeTodo(id));
        console.log('✅ THUNK: Todo gelöscht:', id);
    } catch (error: any) {
        // Optional: Fehlerbehandlung hier (z.B. Error-Logging)
        console.error('❌ THUNK: Fehler beim Löschen des Todos:', error);
    }
  };
  
};

// ============================================
// AUFGABE 8: TOGGLE TODO THUNK
// ============================================
/**
 * TODO: Implementiere toggleTodoThunk
 * 
 * HINWEIS:
 * - Parameter: id (string)
 * - API Call: todoService.toggleTodo(id)
 * - Success: dispatch(updateTodo(updatedTodo))
 */
export const toggleTodoThunk = (id: string) => {
  return async (dispatch: Dispatch) => {
    try {
        console.log('🔵 THUNK: Toggle Todo:', id);
        const updatedTodo = await todoService.toggleTodo(id);
        dispatch(updateTodo(updatedTodo));
        console.log('✅ THUNK: Todo getoggled:', updatedTodo);
    } catch (error: any) {
        // Optional: Fehlerbehandlung hier (z.B. Error-Logging)
        console.error('❌ THUNK: Fehler beim Toggeln des Todos:', error);
    }
  };
};

// ============================================
// ZUSAMMENFASSUNG DER VERFÜGBAREN ACTIONS
// ============================================
/**
 * AUS todosSlice.ts:
 * - fetchTodosStart() -> loading = true
 * - fetchTodosSuccess(todos) -> items = todos, loading = false
 * - fetchTodosFailure(error) -> error setzen, loading = false
 * - addTodo(todo) -> Todo zur Liste hinzufügen
 * - updateTodo(todo) -> Todo in Liste aktualisieren
 * - removeTodo(id) -> Todo aus Liste entfernen
 * 
 * AUS todoService.ts:
 * - fetchTodos() -> Promise<Todo[]>
 * - createTodo(text) -> Promise<Todo>
 * - updateTodo(id, updates) -> Promise<Todo>
 * - deleteTodo(id) -> Promise<void>
 * - toggleTodo(id) -> Promise<Todo>
 */
