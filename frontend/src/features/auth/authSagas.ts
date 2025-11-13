import { call, put, takeLatest, all, CallEffect, PutEffect } from 'redux-saga/effects';
import { authStart, authSuccess, authFailure } from './authSlice';
import * as authService from '../../services/authService';
import { loginRequest, registerRequest } from './authSagaActions';
import { fetchTodosRequest } from '../todos/todosSagaActions';


// Worker Saga: Führt Login-Logik aus
function* loginSaga(action: ReturnType<typeof loginRequest>): Generator<CallEffect | PutEffect, void, any> {
    try {
        yield put(authStart());
        const response: Awaited<ReturnType<typeof authService.login>> = yield call(authService.login, action.payload);
        yield put(authSuccess({
            user: response.user,
            token: response.token,
            middlewareType: 'saga'
        }));
        // ✅ Nach erfolgreichem Login: Todos laden
        yield put(fetchTodosRequest());
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Login fehlgeschlagen';
        yield put(authFailure(errorMessage));
    }
} 

function* registerSaga(action: ReturnType<typeof registerRequest>): Generator<CallEffect | PutEffect, void, any> {
    try {
        yield put(authStart());
        const response: Awaited<ReturnType<typeof authService.register>> = yield call(authService.register, action.payload);
        yield put(authSuccess({
            user: response.user,
            token: response.token,
            middlewareType: 'saga'
        }));
        // ✅ Nach erfolgreichem Register: Todos laden
        yield put(fetchTodosRequest());
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Registrierung fehlgeschlagen';
        yield put(authFailure(errorMessage));
    }
}

// Watcher Saga: Lauscht auf LOGIN_REQUEST Actions
function* watchLogin() {
    yield takeLatest('auth/loginRequest', loginSaga);
}

function* watchRegister() {
    yield takeLatest('auth/registerRequest', registerSaga);
}

// Root Saga: Kombiniert alle Auth-Watchers
export function* authRootSaga() {
    yield all([
        watchLogin(),
        watchRegister(), // Später für Exercise 2
    ]);
}
