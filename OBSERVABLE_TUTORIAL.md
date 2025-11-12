# 🌊 REDUX OBSERVABLE TUTORIAL

## Lernziel
Redux Observable mit RxJS für reaktive Streams und komplexe async Patterns verstehen.

---

## 📚 Was ist Redux Observable?

Redux Observable nutzt **RxJS** (Reactive Extensions) für Side Effects.

### RxJS Crashkurs:

```typescript
import { of, from } from 'rxjs';
import { map, filter, delay } from 'rxjs/operators';

// Observable = Stream von Werten über Zeit
const numbers$ = of(1, 2, 3, 4, 5);

numbers$
  .pipe(
    filter(n => n % 2 === 0), // Nur gerade Zahlen
    map(n => n * 10),          // x10
    delay(1000)                 // 1s verzögern
  )
  .subscribe(value => console.log(value)); // 20, 40
```

**Observable** = Wie ein Array, aber über Zeit verteilt
**Pipe** = Verkettung von Operatoren
**Subscribe** = "Start den Stream"

---

## 🎯 Redux Observable Konzepte

### 1. Epics (wie Sagas, aber mit Observables)
```typescript
import { ofType } from 'redux-observable';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const loginEpic = (action$) =>
  action$.pipe(
    ofType('auth/loginRequest'),     // Filter nur login Actions
    mergeMap(action =>               // Für jede Action...
      from(authService.login(action.payload)).pipe(
        map(response => authSuccess(response)),    // Success
        catchError(error => of(authFailure(error))) // Error
      )
    )
  );
```

### 2. Action Stream
```typescript
// action$ = Stream aller Actions
// Jede dispatched Action fließt durch diesen Stream
```

### 3. State Stream
```typescript
// state$ = Stream des aktuellen States
const epic = (action$, state$) =>
  action$.pipe(
    ofType('todo/add'),
    withLatestFrom(state$),
    map(([action, state]) => {
      // Zugriff auf aktuellen State!
    })
  );
```

---

## 🔄 Epic Flow

```
1. Component dispatcht loginRequest()
   ↓
2. Action fließt in action$ Stream
   ↓
3. Epic filtert mit ofType('auth/loginRequest')
   ↓
4. mergeMap führt API Call aus
   ↓
5. map verwandelt Response in authSuccess Action
   ↓
6. authSuccess wird automatisch dispatched
   ↓
7. Reducer aktualisiert State
```

---

## 📦 Installation

```bash
cd frontend
npm install redux-observable rxjs
```

---

## 📝 AUFGABEN

### ✅ AUFGABE 1: Epic Actions definieren

**Datei:** Erstelle `frontend/src/features/auth/authEpicActions.ts`

```typescript
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

### ✅ AUFGABE 2: Login Epic implementieren

**Datei:** Erstelle `frontend/src/features/auth/authEpics.ts`

```typescript
import { ofType } from 'redux-observable';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { of, from } from 'rxjs';
import { authStart, authSuccess, authFailure } from './authSlice';
import * as authService from '../../services/authService';

// Login Epic
export const loginEpic = (action$) =>
  action$.pipe(
    // 1. Nur 'auth/loginRequest' Actions
    ofType('auth/loginRequest'),
    
    // 2. Für jede Action...
    mergeMap((action) =>
      // 3. API Call als Observable
      from(authService.login(action.payload)).pipe(
        // 4. Response -> Success Action
        map(response => authSuccess({
          user: response.user,
          token: response.token,
        })),
        // 5. Error -> Failure Action
        catchError(error => {
          const errorMessage = error.response?.data?.error || 'Login fehlgeschlagen';
          return of(authFailure(errorMessage));
        })
      )
    )
  );

// Loading Epic (separates Concern!)
export const loginLoadingEpic = (action$) =>
  action$.pipe(
    ofType('auth/loginRequest'),
    map(() => authStart()) // Dispatched authStart bei loginRequest
  );
```

---

### ✅ AUFGABE 3: Epic Middleware konfigurieren

**Datei:** `frontend/src/app/store.ts`

```typescript
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { loginEpic, loginLoadingEpic } from '../features/auth/authEpics';

// Root Epic (alle Epics kombinieren)
const rootEpic = combineEpics(
  loginEpic,
  loginLoadingEpic,
  // registerEpic,
  // fetchTodosEpic,
  // ...
);

// Epic Middleware erstellen
const epicMiddleware = createEpicMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    todos: todosReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true })
      .concat(epicMiddleware), // Epic Middleware hinzufügen
});

// Epics starten
epicMiddleware.run(rootEpic);
```

---

### ✅ AUFGABE 4: Components anpassen

**Statt Thunk:**
```typescript
dispatch(loginThunk({ email, password }));
```

**Mit Epic:**
```typescript
dispatch(loginRequest({ email, password }));
```

---

### ✅ AUFGABE 5: Weitere Epics implementieren

Implementiere:
- `registerEpic`
- `fetchTodosEpic`
- `createTodoEpic`
- `updateTodoEpic`
- `deleteTodoEpic`
- `toggleTodoEpic`

---

## 🎓 RXJS OPERATOREN ÜBERSICHT

### `ofType(...types)`
Filtert Actions nach Type
```typescript
ofType('auth/loginRequest', 'auth/registerRequest')
```

### `map(fn)`
Transformiert jeden Wert
```typescript
map(action => authSuccess(action.payload))
```

### `mergeMap(fn)` (früher: flatMap)
Für jeden Wert neuen Observable erstellen (parallel)
```typescript
mergeMap(action => from(api.login(action.payload)))
```

### `switchMap(fn)`
Wie mergeMap, aber bricht vorherige ab (z.B. Search)
```typescript
switchMap(action => from(api.search(action.payload)))
```

### `concatMap(fn)`
Wie mergeMap, aber sequentiell (Reihenfolge wichtig)
```typescript
concatMap(action => from(api.saveOrder(action.payload)))
```

### `catchError(fn)`
Error Handling
```typescript
catchError(error => of(authFailure(error.message)))
```

### `delay(ms)`
Verzögerung
```typescript
delay(1000) // 1 Sekunde warten
```

### `debounceTime(ms)`
Debouncing (z.B. Search Input)
```typescript
debounceTime(300) // Warte 300ms nach letztem Event
```

### `throttleTime(ms)`
Throttling (Max X pro Zeitraum)
```typescript
throttleTime(1000) // Max 1x pro Sekunde
```

### `filter(fn)`
Bedingung prüfen
```typescript
filter(action => action.payload.length > 3)
```

### `withLatestFrom(state$)`
Aktuellen State kombinieren
```typescript
withLatestFrom(state$),
map(([action, state]) => /* ... */)
```

---

## 🆚 THUNK vs SAGA vs OBSERVABLE

| Feature | Thunk | Saga | Observable |
|---------|-------|------|------------|
| **Syntax** | Async/Await | Generators | RxJS Streams |
| **Testbarkeit** | ❌ | ✅ | ✅ |
| **Abbruch** | ❌ | ✅ | ✅ (switchMap) |
| **Debouncing** | ❌ Manual | ✅ delay() | ✅ debounceTime() |
| **Parallel** | ❌ Promise.all | ✅ fork/all | ✅ mergeMap |
| **Retry** | ❌ Manual | ✅ retry() | ✅ retry() |
| **Lernkurve** | ✅ Flach | ❌ Steil | ❌ Sehr steil |
| **Best for** | Simple async | Komplexe Flows | Reactive Streams |

---

## 💡 WANN WELCHE MIDDLEWARE?

### Redux Thunk ✅
- Einfache API Calls
- Kleine Apps
- Team kennt async/await

### Redux Saga ✅
- Komplexe async Flows
- Abbruch-Logik wichtig
- Sehr gute Tests nötig

### Redux Observable ✅
- Reaktive Streams
- Debouncing/Throttling
- WebSockets, Events
- Team kennt RxJS

---

## 🎓 VERSTÄNDNISFRAGEN

1. **Was ist ein Observable?**
   → Stream von Werten über Zeit

2. **Was macht `mergeMap`?**
   → Für jeden Input neuen Observable erstellen (parallel)

3. **Unterschied `mergeMap` vs `switchMap`?**
   → mergeMap parallel, switchMap bricht vorherige ab

4. **Wann `catchError` nutzen?**
   → Um Fehler abzufangen und Fehler-Action zurückzugeben

5. **Was ist der Vorteil von Epics?**
   → Sehr mächtig für komplexe reactive Patterns (debounce, retry, etc.)

---

## 🚀 FORTGESCHRITTENE PATTERNS

### Debounced Search
```typescript
const searchEpic = (action$) =>
  action$.pipe(
    ofType('search/input'),
    debounceTime(300),
    switchMap(action =>
      from(api.search(action.payload)).pipe(
        map(results => searchSuccess(results)),
        catchError(error => of(searchFailure(error)))
      )
    )
  );
```

### Retry Logic
```typescript
import { retry, retryWhen, delay, take } from 'rxjs/operators';

const fetchEpic = (action$) =>
  action$.pipe(
    ofType('data/fetch'),
    mergeMap(action =>
      from(api.fetch()).pipe(
        retry(3), // Retry 3x bei Fehler
        // ODER:
        retryWhen(errors => errors.pipe(delay(1000), take(3)))
      )
    )
  );
```

### WebSocket Integration
```typescript
import { webSocket } from 'rxjs/webSocket';

const socket$ = webSocket('ws://localhost:8080');

const websocketEpic = (action$) =>
  action$.pipe(
    ofType('socket/connect'),
    switchMap(() =>
      socket$.pipe(
        map(message => messageReceived(message))
      )
    )
  );
```

---

## ✅ CHECKLISTE

- [ ] redux-observable + rxjs installiert
- [ ] authEpicActions.ts erstellt
- [ ] authEpics.ts mit loginEpic implementiert
- [ ] Epic Middleware in store.ts konfiguriert
- [ ] Root Epic kombiniert und gestartet
- [ ] LoginForm nutzt loginRequest
- [ ] Login funktioniert mit Epic
- [ ] Weitere Epics implementiert
- [ ] RxJS Operatoren verstanden

---

## 🐛 DEBUGGING TIPPS

**Problem: "Epic wird nicht ausgeführt"**
→ epicMiddleware.run(rootEpic) aufrufen!

**Problem: "Action wird nicht gefangen"**
→ ofType() String exakt wie Action Type

**Problem: "Stream completed zu früh"**
→ catchError muss Observable zurückgeben (of(...))

**Problem: "Mehrere API Calls gleichzeitig"**
→ Nutze switchMap statt mergeMap

---

## 📖 WEITERFÜHREND

**RxJS lernen:**
- [RxJS Marbles](https://rxmarbles.com/) - Visualisiere Operatoren
- [Learn RxJS](https://www.learnrxjs.io/) - Operator Reference
- [RxJS Docs](https://rxjs.dev/) - Offizielle Docs

**Nächster Schritt:** Vergleiche alle 3 Middleware!
