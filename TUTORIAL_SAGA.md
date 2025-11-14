# Redux Saga - Funktionsweise

## Was ist Redux Saga?

**Saga** = Generator Functions für async Logik - pausierbar, testbar, abbruchfähig

**Normal vs Generator:**
```typescript
// Normale Funktion
function normal() {
  return 1;
  return 2; // Wird nie erreicht!
}

// Generator Funktion
function* generator() {
  yield 1;  // Pause, gibt 1 zurück
  yield 2;  // Pause, gibt 2 zurück
}

const gen = generator();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
```

**Vorteil:** Mit `yield` kann die Funktion pausieren und später weitermachen

---

## Flow im Projekt

### 1. Action wird dispatcht

```
Component
  ↓ dispatch(authStart({ email, password }))
Redux Store
  ↓ Action fließt durch Middlewares
Saga Middleware
  ↓ "Gibt es einen Watcher für authStart?"
```

### 2. Watcher Saga erkennt Action

```typescript
function* watchLogin() {
  yield takeLatest('auth/authStart', loginSaga);
  // "Wenn authStart kommt → starte loginSaga"
}
```

```
Watcher
  ↓ "Ja! authStart erkannt!"
  ↓ startet Worker Saga
```

### 3. Worker Saga macht die Arbeit

```typescript
function* loginSaga(action) {
  try {
    // yield = pausiert hier, wartet auf API Response
    const response = yield call(authService.login, action.payload);
    
    // API fertig → weiter
    yield put(authSuccess(response));
  } catch (error) {
    yield put(authFailure(error));
  }
}
```

```
Worker Saga
  ↓ yield call(api.login) → pausiert, wartet
API Call
  ↓ Response zurück
Worker Saga
  ↓ weiter → yield put(authSuccess)
Redux Store
  ↓ authSuccess Action → Reducer
State Update
```

---

## Die 3 Teile einer Saga

### 1. Worker Saga (macht die Arbeit)

```typescript
function* loginSaga(action) {
  try {
    const response = yield call(authService.login, action.payload);
    yield put(authSuccess(response));
  } catch (error) {
    yield put(authFailure(error.message));
  }
}
```

**Was passiert:**
- `yield call(fn, args)` = ruft Funktion auf, wartet auf Ergebnis
- `yield put(action)` = dispatcht neue Action

### 2. Watcher Saga (lauscht auf Actions)

```typescript
function* watchLogin() {
  yield takeLatest('auth/authStart', loginSaga);
}
```

**Was passiert:**
- `takeLatest` = bei jeder `authStart` Action → starte `loginSaga`
- Wenn neue Action kommt bevor alte fertig → bricht alte ab

### 3. Root Saga (kombiniert alle Watcher)

```typescript
export function* authSaga() {
  yield all([
    watchLogin(),
    watchRegister(),
  ]);
}
```

**Was passiert:**
- `all([...])` = startet alle Watcher parallel

---

## Wichtige Saga Effects

| Effect | Was macht's? | Beispiel |
|--------|--------------|----------|
| `call(fn, ...args)` | Ruft Funktion auf, wartet | `yield call(api.login, data)` |
| `put(action)` | Dispatcht Action | `yield put(authSuccess(user))` |
| `takeLatest(type, saga)` | Lauscht auf Action, bricht vorherige ab | `yield takeLatest('LOGIN', loginSaga)` |
| `takeEvery(type, saga)` | Lauscht auf Action, alle parallel | `yield takeEvery('FETCH', fetchSaga)` |
| `all([...])` | Startet mehrere Sagas parallel | `yield all([saga1(), saga2()])` |
| `select(selector)` | Liest State | `const user = yield select(state => state.auth.user)` |

---

## Praktisches Beispiel: Login

**Datei:** `frontend/src/features/auth/authSagas.ts`

```typescript
import { call, put, takeLatest, all } from 'redux-saga/effects';
import { authStart, authSuccess, authFailure } from './authSlice';
import * as authService from '../../services/authService';

// Worker: macht API Call
function* loginSaga(action) {
  try {
    const response = yield call(authService.login, action.payload);
    yield put(authSuccess({
      user: response.user,
      token: response.token,
      middlewareType: 'saga'
    }));
  } catch (error) {
    yield put(authFailure(error.message));
  }
}

// Watcher: lauscht auf authStart
function* watchLogin() {
  yield takeLatest(authStart.type, loginSaga);
}

// Root: kombiniert alle
export function* authSaga() {
  yield all([
    watchLogin(),
  ]);
}
```

**Store Setup:**
```typescript
import createSagaMiddleware from 'redux-saga';
import { authSaga } from '../features/auth/authSagas';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: { auth },
  middleware: (getDefault) => getDefault().concat(sagaMiddleware),
});

sagaMiddleware.run(authSaga);
```

---

## Warum Saga vs Thunk?

### Thunk (async/await)
```typescript
const loginThunk = (credentials) => async (dispatch) => {
  dispatch(authStart());
  const data = await api.login(credentials);  // ⚠️ Nicht testbar ohne Mock
  dispatch(authSuccess(data));
};
```

### Saga (yield)
```typescript
function* loginSaga(action) {
  const data = yield call(api.login, action.payload);  // ✅ Testbar!
  yield put(authSuccess(data));
}
```

**Test:**
```typescript
const gen = loginSaga({ payload: credentials });
expect(gen.next().value).toEqual(call(api.login, credentials));
expect(gen.next(mockData).value).toEqual(put(authSuccess(mockData)));
```

**Vorteil Saga:**
- ✅ Kein Mocking nötig
- ✅ Jeder Schritt einzeln testbar
- ✅ Abbruch mit `cancel()`
- ✅ Strukturierter Code

---

## Wann Saga nutzen?

✅ **Ja wenn:**
- Komplexe async Flows (Multi-Step Wizards)
- Testing wichtig
- Abbrüche nötig (z.B. bei Suche)
- Retry-Logik, Polling

❌ **Nein wenn:**
- Einfache CRUD App
- Team kennt Generators nicht
- Prototyp / MVP
