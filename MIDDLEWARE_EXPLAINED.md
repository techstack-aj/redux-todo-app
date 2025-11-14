# Redux Middleware - Funktionsweise

## Was ist Middleware?

**Middleware** = Schicht zwischen Action und Reducer - fängt Actions ab und kann async Zeug machen

```
Component dispatch(action)
    ↓
Middleware (fängt ab, macht API Call)
    ↓
Reducer (bekommt Action)
    ↓
State Update
```

**Ohne Middleware:**
```typescript
dispatch({ type: 'ADD_TODO', payload: todo });
// → direkt in Reducer → State Update
```

**Mit Middleware:**
```typescript
dispatch(loginThunk({ email, password }));
// → Middleware fängt ab → macht API Call → dispatcht weitere Actions → Reducer
```

---

## Flow im Detail

### 1. Normale Action (ohne Middleware)

```
Component
  ↓ dispatch({ type: 'INCREMENT' })
Reducer 
  ↓ case 'INCREMENT': state.count++
State Update
  ↓
Component re-rendert
```

### 2. Async Action (mit Middleware)

```
Component
  ↓ dispatch(loginThunk(credentials))
Thunk Middleware
  ↓ erkennt: "Das ist eine Funktion!"
  ↓ führt aus: API Call
  ↓ dispatcht: authStart() → Reducer
  ↓ wartet auf Response
  ↓ dispatcht: authSuccess(data) → Reducer
State Update
  ↓
Component re-rendert
```

---

## Die 3 Middlewares im Projekt

### 🔵 Thunk - Die Einfache

**Konzept:** Funktion gibt Funktion zurück

```typescript
const loginThunk = (credentials) => {
  return async (dispatch) => {
    dispatch(authStart());
    const data = await api.login(credentials);
    dispatch(authSuccess(data));
  };
};
```

**Wie wird sie erkannt?**
```typescript
// Middleware prüft:
if (typeof action === 'function') {
  // Das ist ein Thunk! Ausführen:
  return action(dispatch, getState);
}
```

**Wann nutzen?** Einfache CRUD Apps, Team kennt async/await

---

### 🟢 Saga - Die Testbare

**Konzept:** Generator Functions - pausierbar, abbruchfähig

```typescript
function* loginSaga(action) {
  try {
    // yield = pausiert hier, wartet auf API
    const data = yield call(api.login, action.payload);
    yield put(authSuccess(data));
  } catch (error) {
    yield put(authFailure(error));
  }
}

// Watcher: Lauscht auf Actions
function* watchLogin() {
  yield takeLatest('auth/loginRequest', loginSaga);
}
```

**Wie wird sie erkannt?**
```typescript
// Watcher lauscht auf Action Type
yield takeLatest('auth/loginRequest', loginSaga);
// Wenn Action mit Type 'auth/loginRequest' kommt → starte loginSaga
```

**Wann nutzen?** Komplexe Flows, Testing wichtig, Abbrüche nötig

---

### 🟣 Observable - Die Reaktive

**Konzept:** Actions als Stream behandeln (RxJS)

```typescript
const loginEpic = (action$, state$) =>
  action$.pipe(
    ofType('auth/loginRequest'),    // Filter: nur diese Action
    switchMap((action) =>            // API Call
      from(api.login(action.payload)).pipe(
        map((data) => authSuccess(data))
      )
    )
  );
```

**Wie wird sie erkannt?**
```typescript
// Epic lauscht auf Action Stream
ofType('auth/loginRequest')  // Wenn diese Action im Stream → reagiere
```

**Wann nutzen?** Echtzeit-Streams, viele Events, Team kennt RxJS

---

## Parallelbetrieb im Projekt

**Problem:** Alle 3 Middlewares laufen gleichzeitig!

```
dispatch(authStart())
  ↓
Thunk hört → macht API Call
Saga hört → macht API Call
Observable hört → macht API Call
  ↓
3x API Call! ❌
```

**Lösung:** Middleware-Filter

```typescript
// In Action mitgeben welche Middleware zuständig ist
dispatch(authStart({ loadingType: 'thunk' }));

// Saga prüft
if (action.payload?.loadingType !== 'saga') {
  return; // Nicht für mich → ignorieren
}

// Observable prüft
filter(() => state$.value.auth.middlewareType === 'observable')
```

**Resultat:** Nur die gewählte Middleware reagiert ✅

---

## Vergleich

|               | Thunk           | Saga         | Observable  |
|---------------|-----------------|--------------|-------------|
| **Syntax**    | async/await     | yield        | pipe()      |
| **Lernkurve** | ✅ Flach        | ⚠️ Mittel   | ❌ Steil    |
| **Testbar**   | ❌ Schwer       | ✅ Einfach  | ✅ Gut      |
| **Abbruch**   | ❌ Nein         | ✅ Ja       | ✅ Ja       |
| **Retry**     | ⚠️ Selbst bauen | ✅ Built-in | ✅ Built-in |
| **Wann?**     | CRUD Apps       | Enterprise   | Streams     |

---

## Praktisches Beispiel: Login

### Mit Thunk
```typescript
dispatch(loginThunk({ email, password }));
// → Thunk macht API Call → dispatcht authSuccess
```

### Mit Saga
```typescript
dispatch(loginRequest({ email, password }));
// → Watcher erkennt → startet loginSaga → dispatcht authSuccess
```

### Mit Observable
```typescript
dispatch(authStart({ email, password, loadingType: 'observable' }));
// → Epic erkennt → macht API Call → dispatcht authSuccess
```

**Resultat:** Alle 3 machen dasselbe, nur unterschiedlich!
