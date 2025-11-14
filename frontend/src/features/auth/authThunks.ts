// Auth Thunks - Redux Thunk für asynchrone Authentication
import { Dispatch } from 'redux';
import { authStart, authSuccess, authFailure } from './authSlice';
import { LoginCredentials, RegisterCredentials } from '../../types';
import * as authService from '../../services/authService';

// Thunk für Login mit API-Call und Error-Handling
export const loginThunk = (credentials: LoginCredentials) => {
  return async (dispatch: Dispatch) => {
    try {
        console.log('🔵 THUNK: Login wird gestartet:', credentials.email);
        dispatch(authStart({ loadingType: 'thunk' }));
        const { user, token } = await authService.login(credentials);
        dispatch(authSuccess({ user, token, middlewareType: 'thunk' }));
        console.log('✅ THUNK: Login erfolgreich:', user);
    } catch (error: any) {
        const errorMessage =
            error.response?.data?.error || error.message || 'Login fehlgeschlagen';
        dispatch(authFailure(errorMessage));
    }
  };
};

// Thunk für Registrierung mit API-Call und Error-Handling
export const registerThunk = (credentials: RegisterCredentials) => {
  return async (dispatch: Dispatch) => {
    try {
        console.log('🔵 THUNK: Registrierung wird gestartet:', credentials.email);
        dispatch(authStart({ loadingType: 'thunk' }));
        const { user, token } = await authService.register(credentials);
        dispatch(authSuccess({ user, token, middlewareType: 'thunk' }));
        console.log('✅ THUNK: Registrierung erfolgreich:', user);
    } catch (error: any) {
        const errorMessage =
            error.response?.data?.error || error.message || 'Registrierung fehlgeschlagen';
        dispatch(authFailure(errorMessage));
    }
  };
};

// Optional: Load Current User Thunk für persistente Sessions
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
