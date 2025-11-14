# Redux Observable - Funktionsweise

## Was ist Redux Observable?

**Observable** = Actions als Stream behandeln - reaktiv, composable, mächtige Operators

**Normal vs Stream:**
```typescript
// Array (alle Werte sofort)
[1, 2, 3].map(x => x * 2);  // [2, 4, 6]

// Observable (Werte über Zeit)
stream$.pipe(
  map(x => x * 2)
);
// Wenn 1 kommt → 2
// Wenn 2 kommt → 4
// Wenn 3 kommt → 6
```

**Vorteil:** Stream kann man transformieren, filtern, verzögern - alles über Zeit

---

## Flow im Projekt

### 1. Action wird zu Stream

```
Component
  ↓ dispatch(authStart({ email, password }))
Redux Store
  ↓ Action fließt durch Middlewares
Epic Middleware
  ↓ Action wird in Stream eingefügt
Action Stream (action$)
```

### 2. Epic filtert und reagiert

```typescript
const loginEpic = (action$, state$) =>
  action$.pipe(
    ofType('auth/authStart'),  // Filter: nur authStart
    // Action erkannt!
```

```
Action Stream
  ↓ authStart erkannt
Epic
  ↓ "Das ist für mich!"
```

### 3. Epic macht API Call

```typescript
    switchMap((action) =>
      from(authService.login(action.payload)).pipe(
        map((response) => authSuccess(response))
      )
    )
```

```
Epic
  ↓ switchMap → API Call (Observable)
API Response
  ↓ map → authSuccess Action
Action zurück in Redux
  ↓ Reducer
State Update
```

---

## Epic Aufbau

```typescript
const epicName = (action$, state$) =>
  action$.pipe(
    ofType('ACTION_TYPE'),        // 1. Welche Action?
    filter((action) => ...),       // 2. Zusätzlicher Filter?
    switchMap((action) =>          // 3. Async Operation
      from(api.call()).pipe(       // 4. API Call als Observable
        map((data) => successAction(data)),  // 5. Success
        catchError((err) => of(failureAction(err)))  // 6. Error
      )
    )
  );
```

**Parameter:**
- `action$` = Stream aller Actions
- `state$` = Stream des Redux States

**Return:** Stream von Actions

---

## Wichtige RxJS Operators

| Operator | Was macht's? | Wann nutzen? |
|----------|--------------|--------------|
| `ofType('TYPE')` | Filtert Actions nach Type | Immer am Anfang |
| `filter(fn)` | Custom Filter | Middleware-Check |
| `map(fn)` | Transformiert Daten | Success Action erstellen |
| `switchMap(fn)` | Async, bricht vorherige ab | API Calls (Search) |
| `mergeMap(fn)` | Async, parallel | Mehrere API Calls gleichzeitig |
| `catchError(fn)` | Error handling | Immer bei API Calls |
| `debounceTime(ms)` | Wartet x ms | Search, Input |
| `retry(n)` | n Versuche bei Fehler | Unstable APIs |

---

## Praktisches Beispiel: Login

**Datei:** `frontend/src/features/auth/authEpic.ts`

```typescript
import { ofType } from 'redux-observable';
import { switchMap, map, catchError, filter } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { authStart, authSuccess, authFailure } from './authSlice';
import * as authService from '../../services/authService';

export const loginEpic = (action$, state$) =>
  action$.pipe(
    // 1. Filtere nur authStart Actions
    ofType(authStart.type),
    
    // 2. Nur wenn Observable-Middleware aktiv
    filter((action) => action.payload?.loadingType === 'observable'),
    
    // 3. API Call
    switchMap((action) =>
      from(authService.login(action.payload)).pipe(
        // Success
        map((response) => 
          authSuccess({
            user: response.user,
            token: response.token,
            middlewareType: 'observable'
          })
        ),
        // Error
        catchError((error) => 
          of(authFailure(error.response?.data?.error || 'Login failed'))
        )
      )
    )
  );
```

**Store Setup:**
```typescript
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { loginEpic } from '../features/auth/authEpic';

const rootEpic = combineEpics(loginEpic);
const epicMiddleware = createEpicMiddleware();

const store = configureStore({
  reducer: { auth },
  middleware: (getDefault) => getDefault().concat(epicMiddleware),
});

epicMiddleware.run(rootEpic);
```

---

## Fortgeschrittene Patterns

### 1. Debounce (Search)

```typescript
const searchEpic = (action$) =>
  action$.pipe(
    ofType('search/input'),
    debounceTime(500),  // Warte 500ms nach letzter Eingabe
    switchMap((action) =>
      from(api.search(action.payload)).pipe(
        map((results) => searchSuccess(results))
      )
    )
  );
```

**Flow:**
```
User tippt: "H" → wartet 500ms
User tippt: "e" → wartet 500ms
User tippt: "l" → wartet 500ms
User tippt: "l" → wartet 500ms
User tippt: "o" → wartet 500ms
(500ms vorbei, keine neue Eingabe)
→ API Call mit "Hello"
```

### 2. Retry (Unstable API)

```typescript
const fetchEpic = (action$) =>
  action$.pipe(
    ofType('data/fetch'),
    switchMap(() =>
      from(api.fetch()).pipe(
        retry(3),  // 3 Versuche
        map((data) => fetchSuccess(data)),
        catchError((error) => of(fetchFailure(error)))
      )
    )
  );
```

### 3. Parallel Requests (mergeMap)

```typescript
const toggleEpic = (action$) =>
  action$.pipe(
    ofType('todos/toggle'),
    mergeMap((action) =>  // Nicht abbrechen, alle parallel!
      from(api.toggle(action.payload)).pipe(
        map(() => toggleSuccess(action.payload))
      )
    )
  );
```

---

## switchMap vs mergeMap vs concatMap

```
switchMap: Bricht vorherige ab
User klickt 3x schnell → nur letzter Request zählt
(Search, Autocomplete)

mergeMap: Alle parallel
User klickt 3x schnell → 3 Requests parallel
(Toggle, Like, Delete)

concatMap: Warteschlange
User klickt 3x schnell → 1. fertig, dann 2., dann 3.
(Order Processing, Sequentielle Operationen)
```

---

## Warum Observable vs Saga?

### Saga
```typescript
function* loginSaga(action) {
  const data = yield call(api.login, action.payload);
  yield put(authSuccess(data));
}
```

### Observable
```typescript
const loginEpic = (action$) =>
  action$.pipe(
    ofType('auth/login'),
    switchMap((action) =>
      from(api.login(action.payload)).pipe(
        map((data) => authSuccess(data))
      )
    )
  );
```

**Vorteile Observable:**
- ✅ Mächtige Operators (debounce, retry, throttle)
- ✅ Composable (Streams kombinieren)
- ✅ Reaktiv (perfekt für Echtzeit)

**Nachteile Observable:**
- ❌ RxJS Lernkurve steil
- ❌ Kleinere Community
- ❌ Debugging schwieriger

---

## Wann Observable nutzen?

✅ **Ja wenn:**
- Team kennt RxJS
- Echtzeit-Streams (WebSocket, Server-Sent Events)
- Viele async Events
- Debouncing, Throttling wichtig

❌ **Nein wenn:**
- Team kennt RxJS nicht
- Einfache CRUD App (→ Thunk)
- Testing > Reaktivität (→ Saga)
