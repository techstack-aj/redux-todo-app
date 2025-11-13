// ============================================
// AUTH SLICE - Redux Toolkit
// ============================================
// Verwaltet Authentication State (User, Token, Loading, Errors)

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, MiddlewareType } from '../../types';

// Initial State
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'), // Token aus localStorage laden
  isAuthenticated: false,
  loading: false,
  error: null,
  middlewareType: null,
};

// ============================================
// SLICE DEFINITION
// ============================================
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login/Register Start
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    // Login/Register Success
    authSuccess: (state, action: PayloadAction<{ user: User; token: string; middlewareType?: MiddlewareType }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      
      // Middleware-Typ speichern (falls übergeben)
      if (action.payload.middlewareType) {
        state.middlewareType = action.payload.middlewareType;
        localStorage.setItem('middlewareType', action.payload.middlewareType);
      }

      // Token in localStorage speichern
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },

    // Login/Register Failure
    authFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.middlewareType = null;

      // localStorage clearen
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('middlewareType');
    },

    // User aus localStorage laden (beim App-Start)
    loadUserFromStorage: (state) => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const middlewareType = localStorage.getItem('middlewareType') as MiddlewareType | null;

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          state.token = token;
          state.user = user;
          state.isAuthenticated = true;
          state.middlewareType = middlewareType;
        } catch (error) {
          // Ungültige Daten -> localStorage clearen
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('middlewareType');
        }
      }
    },

    // Error clearen
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

// Actions exportieren
export const {
  authStart,
  authSuccess,
  authFailure,
  logout,
  loadUserFromStorage,
  clearAuthError,
} = authSlice.actions;

// Reducer exportieren
export default authSlice.reducer;
