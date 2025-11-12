// ============================================
// TODOS THUNKS - Redux Thunk Middleware
// ============================================
// LERNZIEL: Redux Thunk für Todo CRUD Operations implementieren

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

// ============================================
// AUFGABE 4: FETCH TODOS THUNK
// ============================================
/**
 * TODO: Implementiere fetchTodosThunk
 * 
 * SCHRITTE:
 * 1. Gib async Funktion zurück die dispatch erhält
 * 2. dispatch(fetchTodosStart()) -> Loading aktivieren
 * 3. const todos = await todoService.fetchTodos()
 * 4. dispatch(fetchTodosSuccess(todos))
 * 5. Catch Block: dispatch(fetchTodosFailure(errorMessage))
 */
export const fetchTodosThunk = () => {
  // TODO: Implementiere hier
  
  throw new Error('fetchTodosThunk noch nicht implementiert');
};

// ============================================
// AUFGABE 5: CREATE TODO THUNK
// ============================================
/**
 * TODO: Implementiere createTodoThunk
 * 
 * HINWEIS: 
 * - Parameter: text (string)
 * - API Call: todoService.createTodo(text)
 * - Success: dispatch(addTodo(newTodo))
 */
export const createTodoThunk = (text: string) => {
  // TODO: Implementiere hier
  
  throw new Error('createTodoThunk noch nicht implementiert');
};

// ============================================
// AUFGABE 6: UPDATE TODO THUNK
// ============================================
/**
 * TODO: Implementiere updateTodoThunk
 * 
 * HINWEIS:
 * - Parameter: id (string), updates (object)
 * - API Call: todoService.updateTodo(id, updates)
 * - Success: dispatch(updateTodo(updatedTodo))
 */
export const updateTodoThunk = (id: string, updates: { text?: string; completed?: boolean }) => {
  // TODO: Implementiere hier
  
  throw new Error('updateTodoThunk noch nicht implementiert');
};

// ============================================
// AUFGABE 7: DELETE TODO THUNK
// ============================================
/**
 * TODO: Implementiere deleteTodoThunk
 * 
 * HINWEIS:
 * - Parameter: id (string)
 * - API Call: todoService.deleteTodo(id) -> kein return value
 * - Success: dispatch(removeTodo(id))
 */
export const deleteTodoThunk = (id: string) => {
  // TODO: Implementiere hier
  
  throw new Error('deleteTodoThunk noch nicht implementiert');
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
  // TODO: Implementiere hier
  
  throw new Error('toggleTodoThunk noch nicht implementiert');
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
