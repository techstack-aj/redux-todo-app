# 🌀 REDUX SAGA TUTORIAL

## Lernziel
Redux Saga mit Generator Functions für komplexe asynchrone Flows verstehen und implementieren.

---

## 📚 Was ist Redux Saga?

Redux Saga nutzt **ES6 Generator Functions** für Side Effects.

### Generator Functions - Crashkurs:
```javascript
// Normale Function
function normal() {
  return 1;
  return 2; // Wird nie erreicht!
}

// Generator Function (mit *)
function* generator() {
  yield 1; // Pause hier, return 1
  yield 2; // Pause hier, return 2
  yield 3; // Pause hier, return 3
}

const gen = generator();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }
```

---

## 🎯 Redux Saga Konzepte

### 1. Sagas (Generator Functions)
```typescript
function* mySaga() {
  yield someEffect();
}
```

### 2. Effects (Saga Befehle)
```typescript
import { call, put, takeLatest } from 'redux-saga/effects';

function* loginSaga(action) {
  try {
    // call = API Call ausführen
    const response = yield call(authService.login, action.payload);
    
    // put = Action dispatchen
    yield put(authSuccess(response));
  } catch (error) {
    yield put(authFailure(error.message));
  }
}
```

### 3. Watcher Sagas
```typescript
function* watchLogin() {
  // takeLatest = Bei jeder LOGIN_REQUEST Action loginSaga starten
  yield takeLatest('auth/loginRequest', loginSaga);
}
```

---

## 🔄 Saga Flow

```
1. Component dispatcht loginRequest({ email, password })
   ↓
2. Watcher Saga (takeLatest) erkennt Action
   ↓
3. Worker Saga (loginSaga) wird gestartet
   ↓
4. yield call(api.login) → API Call
   ↓
5. yield put(authSuccess) → Action dispatchen
   ↓
6. Reducer aktualisiert State
   ↓
7. Component re-rendert
```

---

## 📦 Installation

```bash
cd frontend
npm install redux-saga
```

---

## 📝 AUFGABEN

### ✅ AUFGABE 1: Saga Actions definieren

**Datei:** Erstelle `frontend/src/features/auth/authSagaActions.ts`

```typescript
// Actions die Sagas triggern (nicht Thunks!)
export const loginRequest = (credentials: LoginCredentials) => ({
  type: 'auth/loginRequest' as const,
  payload: credentials,
});

export const registerRequest = (credentials: RegisterCredentials) => ({
  type: 'auth/registerRequest' as const,
  payload: credentials,
});
```

---

### ✅ AUFGABE 2: Login Saga implementieren

**Datei:** Erstelle `frontend/src/features/auth/authSagas.ts`

```typescript
import { call, put, takeLatest } from 'redux-saga/effects';
import { authStart, authSuccess, authFailure } from './authSlice';
import * as authService from '../../services/authService';

// Worker Saga
function* loginSaga(action: ReturnType<typeof loginRequest>) {
  try {
    // 1. Loading aktivieren
    yield put(authStart());

    // 2. API Call (call = side effect)
    const response = yield call(authService.login, action.payload);

    // 3. Success Action dispatchen
    yield put(authSuccess({
      user: response.user,
      token: response.token,
    }));

    console.log('✅ Login erfolgreich (Saga)');
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Login fehlgeschlagen';
    yield put(authFailure(errorMessage));
    console.error('❌ Login fehlgeschlagen (Saga):', errorMessage);
  }
}

// Watcher Saga
function* watchLogin() {
  yield takeLatest('auth/loginRequest', loginSaga);
}

// Root Saga (alle Watchers kombinieren)
export function* authRootSaga() {
  yield all([
    watchLogin(),
    // watchRegister(),
    // ... weitere
  ]);
}
```

---

### ✅ AUFGABE 3: Saga Middleware konfigurieren

**Datei:** `frontend/src/app/store.ts`

```typescript
import createSagaMiddleware from 'redux-saga';
import { authRootSaga } from '../features/auth/authSagas';

// Saga Middleware erstellen
const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    todos: todosReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true })
      .concat(sagaMiddleware), // Saga Middleware hinzufügen
});

// Sagas starten
sagaMiddleware.run(authRootSaga);
```

---

### ✅ AUFGABE 4: Components anpassen

**Statt Thunk:**
```typescript
dispatch(loginThunk({ email, password }));
```

**Mit Saga:**
```typescript
dispatch(loginRequest({ email, password }));
```

---

### ✅ AUFGABE 5: Weitere Sagas implementieren

Implementiere nach gleichem Muster:
- `registerSaga` + `watchRegister`
- `fetchTodosSaga` + `watchFetchTodos`
- `createTodoSaga` + `watchCreateTodo`
- etc.

---

## 🎓 SAGA EFFECTS ÜBERSICHT

### `call(fn, ...args)`
Führt Funktion aus (API Call, Promise, andere Saga)
```typescript
const response = yield call(api.login, credentials);
```

### `put(action)`
Dispatched eine Action
```typescript
yield put(authSuccess(response));
```

### `takeLatest(pattern, saga)`
Startet Saga bei jeder Action, bricht vorherige ab
```typescript
yield takeLatest('auth/loginRequest', loginSaga);
```

### `takeEvery(pattern, saga)`
Startet Saga bei jeder Action, parallel
```typescript
yield takeEvery('todos/fetchRequest', fetchTodosSaga);
```

### `take(pattern)`
Wartet auf eine bestimmte Action
```typescript
yield take('auth/logout');
```

### `fork(saga)`
Startet Saga non-blocking (parallel)
```typescript
yield fork(backgroundTask);
```

### `cancel(task)`
Bricht laufende Saga ab
```typescript
const task = yield fork(longRunningTask);
yield cancel(task);
```

### `select(selector)`
Liest State aus
```typescript
const user = yield select((state) => state.auth.user);
```

---

## 🆚 THUNK vs SAGA

| Feature | Thunk | Saga |
|---------|-------|------|
| **Syntax** | Async/Await | Generators (yield) |
| **Testbarkeit** | ❌ Schwer | ✅ Sehr gut |
| **Abbruch** | ❌ Nein | ✅ Ja (cancel) |
| **Komplexe Flows** | ❌ Unübersichtlich | ✅ Strukturiert |
| **Lernkurve** | ✅ Flach | ❌ Steil |
| **Boilerplate** | ✅ Wenig | ❌ Mehr |

---

## 🎓 VERSTÄNDNISFRAGEN

1. **Was ist ein Generator?**
   → Funktion die pausieren/fortsetzen kann (yield)

2. **Was macht `yield call()`?**
   → Führt API Call aus und wartet auf Ergebnis

3. **Was ist der Unterschied zwischen `call` und direktem API Call?**
   → `call` ist testbar (Pure Function), direkter Call nicht

4. **Wann `takeLatest` vs `takeEvery`?**
   → takeLatest bricht vorherige ab (z.B. Search), takeEvery parallel (z.B. Logs)

5. **Wie testet man Sagas?**
   → Einfach next() aufrufen und yields prüfen (keine Mocks!)

---

## ✅ CHECKLISTE

- [ ] redux-saga installiert
- [ ] authSagaActions.ts erstellt
- [ ] authSagas.ts mit loginSaga implementiert
- [ ] Saga Middleware in store.ts konfiguriert
- [ ] Root Saga gestartet
- [ ] LoginForm nutzt loginRequest statt loginThunk
- [ ] Login funktioniert mit Saga
- [ ] Weitere Sagas implementiert (register, todos)

---

## 🐛 DEBUGGING TIPPS

**Problem: "yield ist undefined"**
→ Funktion braucht `*` (function*)

**Problem: "Saga wird nicht gestartet"**
→ sagaMiddleware.run() aufrufen!

**Problem: "Action wird nicht gefangen"**
→ Prüfe Action Type (muss exakt matchen)

**Problem: "call() gibt undefined zurück"**
→ API Service korrekt importiert? Promise zurückgegeben?

---

## 📖 WEITERFÜHREND

**Fortgeschrittene Patterns:**
- Race Conditions mit `race()`
- Retry Logic mit `retry()`
- Debouncing mit `debounce()`
- Channels für Event Queues

**Nächster Schritt:** OBSERVABLE_TUTORIAL.md
