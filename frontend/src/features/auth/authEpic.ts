// Auth Epic - Redux Observable für Authentication
import { combineEpics, Epic } from 'redux-observable';
import { filter, map, catchError, switchMap, tap, mergeMap } from 'rxjs/operators';
import { of, from } from 'rxjs';
import { authStart, authSuccess, authFailure, logout, registerStart } from './authSlice';
import { login, register } from '../../services/authService';
import { clearTodos } from '../todos/todosSlice';
import { log } from 'console';

// Epic für Login mit Token-Speicherung und Observable-Filter
export const loginEpic: Epic = (action$, state$) =>
    action$.pipe(
        filter((action: any) => action.type === 'auth/authStart' && action.payload?.loadingType === 'observable'),
        switchMap((action: any) => {
            const { email, password } = action.payload;
            console.log('🟣 OBSERVABLE: Login wird gestartet:', email);
            return from(login({ email, password })).pipe(
                tap((response: any) => {
                    localStorage.setItem('token', response.token);
                    console.log('✅ OBSERVABLE: Login erfolgreich, Token gespeichert');
                }),
                map((response: any) => authSuccess({ user: response.user, token: response.token, middlewareType: 'observable' })),
                catchError((error: any) => of(authFailure(error.message)))
            );
        })
    );

// Epic für Registrierung mit Token-Speicherung und Observable-Filter
export const registerEpic: Epic = (action$, state$) =>
    action$.pipe(
        filter((action: any) => action.type === 'auth/registerStart' && action.payload?.loadingType === 'observable'),
        switchMap((action: any) => {
            const { username, email, password } = action.payload;
            console.log('🟣 OBSERVABLE: Registrierung wird gestartet:', email);
            return from(register({ username, email, password })).pipe(
                tap((response: any) => {
                    localStorage.setItem('token', response.token);
                    console.log('✅ OBSERVABLE: Registrierung erfolgreich, Token gespeichert');
                }),
                map((response: any) => authSuccess({ 
                    user: response.user, 
                    token: response.token, 
                    middlewareType: 'observable' 
                })),
                catchError((error: any) => of(authFailure(error.message)))
            );
        })
    );

// Epic für Logout mit Token-Cleanup und Todos-State-Clear (nur bei Observable-Login)
export const logoutEpic: Epic = (action$, state$) =>
    action$.pipe(
        filter((action: any) => {
            const currentState: any = state$.value;
            return action.type === 'auth/logout' && currentState.auth.middlewareType === 'observable';
        }),
        tap(() => {
            console.log('🟣 OBSERVABLE: Logout wird durchgeführt...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('middlewareType');
            console.log('✅ OBSERVABLE: Logout erfolgreich, Token entfernt');
        }),
        map(() => clearTodos())
    );

// ============================================
// EPIC 4: AUTO-LOGOUT BEI TOKEN-ABLAUF (BONUS)
// ============================================
// Ziel: Alle 60s Token-Ablauf checken → Bei abgelaufen: Auto-Logout
//
// SCHRITTE:
// 1. interval(60000) erstellen - alle 60 Sekunden
// 2. filter nutzen um nur zu prüfen wenn User eingeloggt
// 3. Token aus State holen und Ablauf-Zeit checken
// 4. filter auf isExpired === true
// 5. map zu logout Action
// 6. takeUntil verwenden um bei manuellem Logout zu stoppen

// TODO: autoLogoutEpic hier implementieren (optional)


// ============================================
// EPIC 5: TOKEN-REFRESH (BONUS)
// ============================================
// Ziel: Token automatisch refreshen bevor er abläuft
//
// SCHRITTE:
// 1. interval für periodisches Refresh (z.B. alle 15 Minuten)
// 2. Nur wenn User eingeloggt
// 3. API-Call zu /auth/refresh
// 4. tap für localStorage Update
// 5. map zu refreshTokenSuccess Action

// TODO: tokenRefreshEpic hier implementieren (optional)


// ============================================
// ALLE EPICS KOMBINIEREN
// ============================================
// SCHRITTE:
// 1. combineEpics aus 'redux-observable' importieren
// 2. rootAuthEpic exportieren
// 3. Alle implementierten Epics als Parameter übergeben

// TODO: rootAuthEpic hier implementieren


// ============================================
// HILFREICHE TIPPS
// ============================================
//
// TOKEN-STORAGE:
// - Token speichern: localStorage.setItem('token', token)
// - Token lesen: localStorage.getItem('token')
// - Token löschen: localStorage.removeItem('token')
//
// JWT TOKEN PRÜFEN:
// - Ablaufdatum steht in Token (JWT decode nötig)
// - Alternativ: Backend prüfen lassen
//
// AXIOS INTERCEPTOR:
// - Token automatisch zu jedem Request hinzufügen
// - In api.ts mit axios.interceptors.request.use()
//
// ERROR-HANDLING:
// - Bei 401 Unauthorized → Auto-Logout
// - catchError nutzen um Fehler abzufangen
//

// Vorerst leer - Epics kommen später
// testEpic entfernt - verursachte Loop

export const rootAuthEpic = combineEpics(loginEpic, logoutEpic, registerEpic);
