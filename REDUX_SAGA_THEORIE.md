# 🌀 Redux Saga - Theoretische Grundlagen

## Was ist Redux Saga?

Redux Saga ist eine **Middleware-Bibliothek** für Redux, die **asynchrone Side Effects** (z.B. API-Calls, Browser-Storage, Timer) auf eine besondere Art verwaltet: Mit **ES6 Generator Functions**.

Statt Promises und Async/Await (wie Redux Thunk) nutzt Saga **Generators**, die bei jedem `yield` pausieren und fortgesetzt werden können. Das macht den Code **testbarer**, **cancellable** und **orchestrierbarer**.

---

## 🎯 Warum Redux Saga?

### Das Problem mit normalem Redux

Redux Reducer müssen **pure functions** sein - keine Side Effects erlaubt:

```javascript
// ❌ FALSCH - Side Effect im Reducer!
const todosReducer = (state, action) => {
  if (action.type === 'FETCH_TODOS') {
    fetch('/api/todos')  // ❌ API Call = Side Effect!
      .then(data => ...);
  }
  return state;
}
```

### Lösung 1: Redux Thunk (einfach, aber limitiert)

```javascript
// ✅ Funktioniert - aber schwer testbar und nicht cancellable
const fetchTodos = () => async (dispatch) => {
  dispatch({ type: 'LOADING' });
  try {
    const data = await fetch('/api/todos');
    dispatch({ type: 'SUCCESS', payload: data });
  } catch (error) {
    dispatch({ type: 'ERROR', payload: error });
  }
};
```

**Probleme:**
- Schwer zu testen (Mocks für fetch nötig)
- Nicht abbrechbar (bei doppeltem Click beide Requests laufen durch)
- Komplexe Flows werden unübersichtlich

### Lösung 2: Redux Saga (komplex, aber mächtig)

```javascript
// ✅ Testbar, cancellable, strukturiert
function* fetchTodosSaga() {
  yield put({ type: 'LOADING' });
  try {
    const data = yield call(fetch, '/api/todos');
    yield put({ type: 'SUCCESS', payload: data });
  } catch (error) {
    yield put({ type: 'ERROR', payload: error });
  }
}
```

**Vorteile:**
- **Testbar** ohne Mocks (Effects sind plain objects)
- **Cancellable** (Saga kann abgebrochen werden)
- **Strukturiert** (komplexe Flows bleiben lesbar)
- **Deklarativ** (beschreibt WAS passiert, nicht WIE)

---

## 🔑 Das Herzstück: Generator Functions

Generator Functions sind das Fundament von Redux Saga. Sie können pausieren und fortgesetzt werden.

### Normale Function vs Generator Function

```javascript
// Normale Function - läuft komplett durch
function normalFunction() {
  console.log('Start');
  console.log('Mitte');
  console.log('Ende');
  return 'Fertig';
}

normalFunction(); 
// Output: Start, Mitte, Ende
// Return: "Fertig"
// Alles auf einmal!
```

```javascript
// Generator Function - kann pausieren! (Stern * beachten)
function* generatorFunction() {
  console.log('Start');
  yield 1;  // PAUSE hier! Gibt 1 zurück und wartet
  
  console.log('Mitte');
  yield 2;  // PAUSE hier! Gibt 2 zurück und wartet
  
  console.log('Ende');
  return 'Fertig';  // ENDE
}

const gen = generatorFunction();

gen.next();  // Start → { value: 1, done: false }
gen.next();  // Mitte → { value: 2, done: false }
gen.next();  // Ende  → { value: 'Fertig', done: true }
```

**Der Clou:** 
- Die Funktion pausiert bei jedem `yield`
- Mit `next()` wird sie fortgesetzt
- Sie "merkt" sich ihren Zustand zwischen den Calls

### Generator mit Werten

```javascript
function* calculator() {
  const a = yield 'Erste Zahl?';
  const b = yield 'Zweite Zahl?';
  return a + b;
}

const calc = calculator();

calc.next();        // { value: 'Erste Zahl?', done: false }
calc.next(5);       // { value: 'Zweite Zahl?', done: false }
calc.next(3);       // { value: 8, done: true }
```

Mit `next(wert)` kann man Werte in die Funktion zurückgeben!

---

## 🏗️ Redux Saga Architektur

### Der komplette Flow

```
1️⃣ Component
   │ dispatch(loginRequest({ email, password }))
   ▼
   
2️⃣ Redux Store
   │ Action läuft durch Middleware
   ▼
   
3️⃣ Saga Middleware
   │ Prüft: Interessiert eine Saga diese Action?
   ▼
   
4️⃣ Watcher Saga (lauscht auf Actions)
   │ takeLatest('LOGIN_REQUEST', loginSaga)
   │ → Startet Worker Saga
   ▼
   
5️⃣ Worker Saga (macht die Arbeit)
   │ yield call(api.login, credentials)
   │ → API Call wird ausgeführt
   │ yield put(loginSuccess(response))
   │ → SUCCESS Action wird dispatched
   ▼
   
6️⃣ Reducer
   │ state = { ...state, user: response.user }
   ▼
   
7️⃣ Component
   │ Re-render mit neuem State
```

### Zwei Arten von Sagas

**1. Watcher Saga** (lauscht auf Actions)
```typescript
function* watchLogin() {
  // Wartet auf 'LOGIN_REQUEST' Action
  yield takeLatest('auth/loginRequest', loginSaga);
}
```

**2. Worker Saga** (macht die eigentliche Arbeit)
```typescript
function* loginSaga(action) {
  // Führt Login durch
  const response = yield call(api.login, action.payload);
  yield put(loginSuccess(response));
}
```

---

## 📦 Saga Effects - Die wichtigsten Befehle

Effects sind **Anweisungen** an die Saga Middleware. Sie sind plain JavaScript Objects und deshalb leicht testbar.

### 1. `call(fn, ...args)` - Funktion aufrufen

```typescript
import { call } from 'redux-saga/effects';

function* loginSaga(action) {
  // Ruft authService.login auf und wartet auf Ergebnis
  const response = yield call(authService.login, action.payload);
  //                     ↑               ↑             ↑
  //                  Effect       Funktion       Argument
  
  console.log(response); // { user: {...}, token: '...' }
}
```

**Warum nicht direkt `await authService.login()`?**
- `call()` gibt ein **Effect Object** zurück: `{ type: 'CALL', fn: authService.login, args: [...] }`
- Die Saga Engine führt den Call aus, nicht die Saga selbst
- Dadurch ist die Saga eine **pure function** → einfach testbar!

**Test-Beispiel:**
```typescript
const gen = loginSaga({ payload: credentials });
const effect = gen.next().value;

expect(effect).toEqual(call(authService.login, credentials));
// Kein API Call nötig im Test!
```

### 2. `put(action)` - Action dispatchen

```typescript
import { put } from 'redux-saga/effects';

function* loginSaga(action) {
  try {
    const response = yield call(authService.login, action.payload);
    
    // Dispatche SUCCESS Action
    yield put({
      type: 'auth/loginSuccess',
      payload: response
    });
  } catch (error) {
    // Dispatche FAILURE Action
    yield put({
      type: 'auth/loginFailure',
      payload: error.message
    });
  }
}
```

`put()` ist das Saga-Äquivalent zu `dispatch()`.

### 3. `takeLatest(pattern, saga)` - Auf Actions reagieren

```typescript
import { takeLatest } from 'redux-saga/effects';

function* watchLogin() {
  // Wenn 'LOGIN_REQUEST' Action kommt → starte loginSaga
  // Bricht vorherige ab, falls noch läuft!
  yield takeLatest('auth/loginRequest', loginSaga);
}
```

**Wichtig:** `takeLatest` bricht die vorherige Saga ab, wenn eine neue Action kommt (z.B. doppelter Button-Click).

**Alternativen:**
- `takeEvery(pattern, saga)` - Startet parallel (alle laufen durch)
- `take(pattern)` - Wartet auf genau eine Action, dann fertig
- `takeLeading(pattern, saga)` - Ignoriert weitere Calls während laufender Saga

### 4. `select(selector)` - State auslesen

```typescript
import { select } from 'redux-saga/effects';

function* createTodoSaga(action) {
  // Lese aktuellen User aus dem Redux State
  const user = yield select(state => state.auth.user);
  
  if (!user) {
    yield put({ type: 'ERROR', payload: 'Not logged in' });
    return;
  }
  
  // Erstelle Todo mit User ID
  yield call(api.createTodo, {
    ...action.payload,
    userId: user.id
  });
}
```

### 5. `all([...effects])` - Parallel ausführen

```typescript
import { all, fork } from 'redux-saga/effects';

function* rootSaga() {
  yield all([
    fork(watchLogin),
    fork(watchRegister),
    fork(watchFetchTodos),
    fork(watchCreateTodo),
  ]);
  // Alle Watchers laufen parallel und lauschen gleichzeitig!
}
```

### 6. `fork(saga)` und `cancel(task)` - Non-blocking Start & Abbruch

```typescript
import { fork, cancel, take } from 'redux-saga/effects';

function* watchFetchWithCancel() {
  while (true) {
    // Warte auf START Action
    yield take('FETCH_START');
    
    // Starte Fetch Task (non-blocking)
    const task = yield fork(fetchDataSaga);
    
    // Warte auf CANCEL Action
    yield take('FETCH_CANCEL');
    
    // Breche Task ab
    yield cancel(task);
  }
}
```

---

## 🎬 Komplettes Beispiel: Login Flow

### Schritt 1: Action Creator

```typescript
// features/auth/authSagaActions.ts
export const loginRequest = (credentials: { email: string; password: string }) => ({
  type: 'auth/loginRequest' as const,
  payload: credentials,
});
```

Diese Action wird vom Component dispatched und triggert die Saga.

### Schritt 2: Worker Saga

```typescript
// features/auth/authSagas.ts
import { call, put } from 'redux-saga/effects';
import * as authService from '../../services/authService';
import { authStart, authSuccess, authFailure } from './authSlice';

function* loginSaga(action: ReturnType<typeof loginRequest>) {
  try {
    // 1. Loading State aktivieren
    yield put(authStart());
    
    // 2. API Call ausführen (pausiert hier bis Response da ist)
    const response = yield call(authService.login, action.payload);
    
    // 3. Success Action dispatchen
    yield put(authSuccess({
      user: response.user,
      token: response.token,
    }));
    
    // 4. Token im localStorage speichern
    yield call([localStorage, 'setItem'], 'token', response.token);
    
    console.log('✅ Login erfolgreich');
  } catch (error: any) {
    // 5. Error Action dispatchen
    const message = error.response?.data?.error || 'Login fehlgeschlagen';
    yield put(authFailure(message));
    console.error('❌ Login Error:', message);
  }
}
```

**Was passiert hier?**
1. `yield put(authStart())` → dispatched Loading Action
2. `yield call(api.login)` → macht API Call, wartet auf Response
3. `yield put(authSuccess())` → dispatched Success Action
4. `yield call([localStorage, 'setItem'])` → speichert Token

Alles schön sequentiell, aber non-blocking!

### Schritt 3: Watcher Saga

```typescript
import { takeLatest, all } from 'redux-saga/effects';

function* watchLogin() {
  yield takeLatest('auth/loginRequest', loginSaga);
}

function* watchRegister() {
  yield takeLatest('auth/registerRequest', registerSaga);
}

// Root Saga kombiniert alle Watchers
export function* authRootSaga() {
  yield all([
    watchLogin(),
    watchRegister(),
  ]);
}
```

### Schritt 4: Store Setup

```typescript
// app/store.ts
import createSagaMiddleware from 'redux-saga';
import { authRootSaga } from '../features/auth/authSagas';

// 1. Saga Middleware erstellen
const sagaMiddleware = createSagaMiddleware();

// 2. Store mit Middleware konfigurieren
export const store = configureStore({
  reducer: {
    auth: authReducer,
    todos: todosReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
});

// 3. Sagas starten (wichtig! Sonst passiert nichts)
sagaMiddleware.run(authRootSaga);
```

### Schritt 5: Component Usage

```typescript
// components/Auth/LoginForm.tsx
import { useDispatch } from 'react-redux';
import { loginRequest } from '../../features/auth/authSagaActions';

function LoginForm() {
  const dispatch = useDispatch();
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Dispatche einfach die Action - Saga kümmert sich um den Rest!
    dispatch(loginRequest({
      email: 'user@example.com',
      password: 'password123'
    }));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form inputs... */}
    </form>
  );
}
```

**Der Component weiß nichts von der Saga!** Er dispatched nur eine Action, die Saga fängt sie ab.

---

## 🆚 Thunk vs Saga im Vergleich

### Mit Thunk (Async/Await):

```typescript
export const loginThunk = (credentials) => async (dispatch) => {
  try {
    dispatch(authStart());
    const response = await authService.login(credentials);
    dispatch(authSuccess(response));
    localStorage.setItem('token', response.token);
  } catch (error) {
    dispatch(authFailure(error.message));
  }
};

// Component
dispatch(loginThunk({ email, password }));
```

**Charakteristik:**
- ✅ Einfacher Syntax (Async/Await)
- ✅ Weniger Boilerplate
- ❌ Schwer testbar (Mocks nötig)
- ❌ Nicht cancellable
- ❌ Komplexe Flows werden schnell unübersichtlich

### Mit Saga (Generator):

```typescript
function* loginSaga(action) {
  try {
    yield put(authStart());
    const response = yield call(authService.login, action.payload);
    yield put(authSuccess(response));
    yield call([localStorage, 'setItem'], 'token', response.token);
  } catch (error) {
    yield put(authFailure(error.message));
  }
}

// Component
dispatch(loginRequest({ email, password }));
```

**Charakteristik:**
- ✅ Sehr gut testbar (keine Mocks nötig)
- ✅ Cancellable
- ✅ Komplexe Flows bleiben strukturiert
- ✅ Deklarativ (Effects beschreiben, Engine führt aus)
- ❌ Mehr Boilerplate (Actions, Watchers, Workers)
- ❌ Steilere Lernkurve (Generators ungewohnt)

---

## 🎓 Wann sollte man Saga nutzen?

### ✅ Gut geeignet für:

1. **Komplexe asynchrone Flows**
   - Mehrere API Calls hintereinander
   - Bedingte Logik zwischen Calls
   - Parallele Requests mit Abhängigkeiten

2. **Cancellation wichtig**
   - Search während Tippen (nur letzter Request zählt)
   - Lange laufende Background Tasks
   - User kann Aktion abbrechen

3. **Race Conditions**
   - Nur neuester Request ist relevant
   - Timeout für API Calls
   - Optimistic Updates mit Rollback

4. **Polling/Retry Logic**
   - Regelmäßig API Status checken
   - Automatische Retries bei Fehlern
   - Exponential Backoff

5. **Testbarkeit wichtig**
   - Unit Tests für Side Effects
   - Integration Tests ohne Backend
   - Vorhersagbares Verhalten

### ❌ Overkill für:

1. **Einfache CRUD Operations**
   - Simpel fetch → dispatch
   - Keine komplexe Logik

2. **Kleine Apps**
   - Wenige asynchrone Actions
   - Boilerplate nicht gerechtfertigt

3. **Team-Constraints**
   - Team kennt Generators nicht
   - Keine Zeit für Einarbeitung

4. **Schnelle Prototypen**
   - Thunk ist schneller implementiert
   - Kann später zu Saga migriert werden

---

## 💡 Fortgeschrittene Patterns

### 1. Debouncing (z.B. Search)

```typescript
import { debounce } from 'redux-saga/effects';

function* watchSearch() {
  // Warte 500ms nach letzter Action bevor Saga gestartet wird
  yield debounce(500, 'search/query', searchSaga);
}

function* searchSaga(action) {
  const results = yield call(api.search, action.payload);
  yield put(searchSuccess(results));
}
```

User tippt "Hello" → Nur 1 API Call nach 500ms statt 5 Calls!

### 2. Race Condition (Timeout)

```typescript
import { race, delay } from 'redux-saga/effects';

function* fetchWithTimeout() {
  const { response, timeout } = yield race({
    response: call(api.fetchData),
    timeout: delay(5000), // 5 Sekunden
  });
  
  if (timeout) {
    yield put({ type: 'TIMEOUT_ERROR' });
  } else {
    yield put({ type: 'SUCCESS', payload: response });
  }
}
```

Wer ist schneller: API oder 5-Sekunden-Timer?

### 3. Retry Logic

```typescript
import { retry, call, put } from 'redux-saga/effects';

function* fetchDataSaga() {
  try {
    // Versuche 3x, warte 2 Sekunden zwischen Versuchen
    const data = yield retry(3, 2000, api.fetchData);
    yield put(fetchSuccess(data));
  } catch (error) {
    yield put(fetchFailure('Failed after 3 retries'));
  }
}
```

### 4. Polling

```typescript
import { delay, call, put, cancel, fork, take } from 'redux-saga/effects';

function* pollSaga() {
  while (true) {
    try {
      const data = yield call(api.fetchStatus);
      yield put(statusUpdate(data));
      yield delay(5000); // Alle 5 Sekunden
    } catch (error) {
      yield put(statusError(error));
    }
  }
}

function* watchPolling() {
  while (true) {
    yield take('POLLING_START');
    const task = yield fork(pollSaga);
    yield take('POLLING_STOP');
    yield cancel(task);
  }
}
```

### 5. Optimistic Updates mit Rollback

```typescript
function* updateTodoSaga(action) {
  const oldTodo = yield select(state => 
    state.todos.find(t => t.id === action.payload.id)
  );
  
  // Optimistic Update (sofort anzeigen)
  yield put(updateTodoOptimistic(action.payload));
  
  try {
    // API Call
    const updated = yield call(api.updateTodo, action.payload);
    yield put(updateTodoSuccess(updated));
  } catch (error) {
    // Rollback bei Fehler
    yield put(updateTodoRollback(oldTodo));
    yield put(showError('Update failed'));
  }
}
```

---

## 🧪 Testing

### Warum sind Sagas so testbar?

Effects sind **plain objects**, keine Funktionsaufrufe:

```typescript
// Saga
function* loginSaga(action) {
  const response = yield call(api.login, action.payload);
  yield put(loginSuccess(response));
}

// Test
const gen = loginSaga({ payload: credentials });

// 1. Test: call Effect
expect(gen.next().value).toEqual(
  call(api.login, credentials)
);

// 2. Test: put Effect
expect(gen.next(mockResponse).value).toEqual(
  put(loginSuccess(mockResponse))
);

// 3. Test: Saga fertig
expect(gen.next().done).toBe(true);
```

**Kein Mock nötig!** Wir testen nur, dass die richtigen Effects in der richtigen Reihenfolge erzeugt werden.

---

## 📚 Zusammenfassung

### Redux Saga in einem Satz:
**Redux Saga nutzt Generator Functions, um asynchrone Side Effects deklarativ, testbar und cancellable zu machen.**

### Die 5 Kernkonzepte:

1. **Generator Functions** (`function*`, `yield`) - pausierbare Funktionen
2. **Effects** (`call`, `put`, `select`) - Anweisungen als Objects
3. **Watcher Sagas** (`takeLatest`, `takeEvery`) - lauschen auf Actions
4. **Worker Sagas** - führen die eigentliche Logik aus
5. **Saga Middleware** - führt Effects aus und orchestriert alles

### Wann Saga nutzen?

- ✅ Komplexe asynchrone Flows
- ✅ Cancellation/Retry/Polling wichtig
- ✅ Testbarkeit Priorität
- ❌ Einfache CRUD Operations
- ❌ Kleine Apps oder Prototypen

---

## 🎯 Next Steps

1. Lies das Tutorial: `SAGA_TUTORIAL.md`
2. Implementiere Login Saga
3. Teste die Saga
4. Erweitere auf Todos
5. Experimentiere mit fortgeschrittenen Patterns

**Redux Saga ist mächtig, aber komplex. Learning by Doing ist der beste Weg!** 🚀
