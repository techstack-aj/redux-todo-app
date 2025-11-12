// ============================================
// TODOS SLICE - Redux Toolkit
// ============================================
// Verwaltet Todos State (Liste, Filter, Loading, Errors)

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TodosState, Todo, TodoFilter } from '../../types';

// Initial State
const initialState: TodosState = {
  items: [],
  filter: 'all',
  loading: false,
  error: null,
};

// ============================================
// SLICE DEFINITION
// ============================================
const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // Todos laden - Start
    fetchTodosStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    // Todos laden - Success
    fetchTodosSuccess: (state, action: PayloadAction<Todo[]>) => {
      state.loading = false;
      state.items = action.payload;
      state.error = null;
    },

    // Todos laden - Failure
    fetchTodosFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Todo hinzufügen
    addTodo: (state, action: PayloadAction<Todo>) => {
      state.items.push(action.payload);
    },

    // Todo aktualisieren
    updateTodo: (state, action: PayloadAction<Todo>) => {
      const index = state.items.findIndex((todo) => todo.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },

    // Todo löschen
    removeTodo: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((todo) => todo.id !== action.payload);
    },

    // Todo toggle (completed)
    toggleTodoLocal: (state, action: PayloadAction<string>) => {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },

    // Filter ändern
    setFilter: (state, action: PayloadAction<TodoFilter>) => {
      state.filter = action.payload;
    },

    // Error clearen
    clearTodosError: (state) => {
      state.error = null;
    },

    // Alle Todos clearen (bei Logout)
    clearTodos: (state) => {
      state.items = [];
      state.filter = 'all';
      state.loading = false;
      state.error = null;
    },
  },
});

// Actions exportieren
export const {
  fetchTodosStart,
  fetchTodosSuccess,
  fetchTodosFailure,
  addTodo,
  updateTodo,
  removeTodo,
  toggleTodoLocal,
  setFilter,
  clearTodosError,
  clearTodos,
} = todosSlice.actions;

// Reducer exportieren
export default todosSlice.reducer;
