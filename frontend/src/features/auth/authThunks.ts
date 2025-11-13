// ============================================
// AUTH THUNKS - Redux Thunk Middleware
// ============================================
// LERNZIEL: Redux Thunk für asynchrone Authentication implementieren
// 
// KONZEPT: Thunk = Funktion die eine Funktion zurückgibt (delayed dispatch)
//
// REDUX THUNK PATTERN:
// 1. Action Creator gibt Funktion zurück (statt Action-Objekt)
// 2. Diese Funktion erhält dispatch und getState als Parameter
// 3. Kann mehrere Actions dispatchen (start, success, failure)
// 4. Kann asynchronen Code ausführen (API Calls, setTimeout, etc.)

import { Dispatch } from 'redux';
import { authStart, authSuccess, authFailure } from './authSlice';
import { LoginCredentials, RegisterCredentials } from '../../types';
import * as authService from '../../services/authService';

// ============================================
// AUFGABE 1: LOGIN THUNK IMPLEMENTIEREN
// ============================================
/**
 * TODO: Implementiere den loginThunk
 * 
 * SCHRITTE:
 * 1. Gib eine Funktion zurück die (dispatch: Dispatch) als Parameter hat
 * 2. Diese Funktion soll async sein (kann await nutzen)
 * 3. In einem try-catch Block:
 *    - dispatch(authStart()) aufrufen (Loading aktivieren)
 *    - authService.login(credentials) awaiten
 *    - dispatch(authSuccess({ user, token })) mit Response-Daten
 *    - Optional: console.log für Debugging
 * 4. Im catch Block:
 *    - Error-Message extrahieren (error.response?.data?.error)
 *    - dispatch(authFailure(errorMessage))
 * 
 * HINWEIS: Das ist das klassische Thunk-Pattern!
 */
export const loginThunk = (credentials: LoginCredentials) => {
  // TODO: Implementiere hier den Thunk
  // return async (dispatch: Dispatch) => { ... }
  return async (dispatch: Dispatch) => {
    try {
        dispatch(authStart());
        const { user, token } = await authService.login(credentials);
        dispatch(authSuccess({ user, token, middlewareType: 'thunk' }));
    } catch (error: any) {
        const errorMessage =
            error.response?.data?.error || error.message || 'Login fehlgeschlagen';
        dispatch(authFailure(errorMessage));
    }
  };
};

// ============================================
// AUFGABE 2: REGISTER THUNK IMPLEMENTIEREN
// ============================================
/**
 * TODO: Implementiere den registerThunk
 * 
 * HINWEIS: Fast identisch zu loginThunk, nur anderer Service-Call:
 * - authService.register(credentials) statt login
 * - Gleiche Error-Handling Logik
 * - Gleiche Success-Handling Logik
 */
export const registerThunk = (credentials: RegisterCredentials) => {
  // TODO: Implementiere hier den Thunk
  return async (dispatch: Dispatch) => {
    try {
        dispatch(authStart());
        const { user, token } = await authService.register(credentials);
        dispatch(authSuccess({ user, token, middlewareType: 'thunk' }));
    } catch (error: any) {
        const errorMessage =
            error.response?.data?.error || error.message || 'Registrierung fehlgeschlagen';
        dispatch(authFailure(errorMessage));
    }
  };
};

// ============================================
// AUFGABE 3: LOAD CURRENT USER THUNK (OPTIONAL)
// ============================================
/**
 * TODO: Implementiere loadCurrentUserThunk (für Token-Validierung)
 * 
 * SCHRITTE:
 * 1. authService.getCurrentUser() awaiten
 * 2. Token aus localStorage holen
 * 3. Wenn Token existiert: dispatch(authSuccess({ user, token }))
 * 4. Bei Error: dispatch(authFailure('Session abgelaufen'))
 * 
 * HINWEIS: Dieser Thunk hat keine Parameter!
 */
export const loadCurrentUserThunk = () => {
  // TODO: Implementiere hier den Thunk
  return async (dispatch: Dispatch) => {
    try {
        dispatch(authStart());
        const user = await authService.getCurrentUser();
        const token = localStorage.getItem('token');
        if (token) {
            dispatch(authSuccess({ user, token }));
        }
    } catch (error) {
        dispatch(authFailure('Session abgelaufen. Bitte neu einloggen.'));
    }
  };
};

// ============================================
// HILFREICHE INFORMATIONEN
// ============================================
/**
 * VERFÜGBARE ACTIONS (aus authSlice):
 * - authStart() -> Loading aktivieren
 * - authSuccess({ user, token }) -> Login erfolgreich
 * - authFailure(errorMessage) -> Error setzen
 * 
 * VERFÜGBARE SERVICES (aus authService):
 * - authService.login(credentials) -> Promise<{ user, token }>
 * - authService.register(credentials) -> Promise<{ user, token }>
 * - authService.getCurrentUser() -> Promise<User>
 * 
 * TYPESCRIPT TYPES:
 * - LoginCredentials: { email: string, password: string }
 * - RegisterCredentials: { username: string, email: string, password: string }
 * 
 * BEISPIEL ERROR HANDLING:
 * const errorMessage = error.response?.data?.error || error.message || 'Fallback Message';
 */
