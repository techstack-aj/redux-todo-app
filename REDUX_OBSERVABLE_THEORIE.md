# 🌊 Redux Observable - Theoretische Grundlagen

## Was ist Redux Observable?

Redux Observable ist eine **Middleware für Redux**, die auf **RxJS** (Reactive Extensions for JavaScript) basiert. Sie ermöglicht es, **asynchrone Actions** mit **Observables** und **reaktiven Programmierung** zu handhaben.

Während Redux Thunk Promises und Async/Await nutzt und Redux Saga Generators verwendet, arbeitet Redux Observable mit **Streams** – kontinuierlichen Datenflüssen über die Zeit.

---

## 🎯 Was sind Observables?

### Das Stream-Konzept

Stell dir einen **Stream** wie einen Fluss vor, der über die Zeit Werte transportiert:

```
Zeit →→→→→→→→→→→→→→→→→→→→→

Stream:  1----2----3----4----5--→
         │    │    │    │    │
         ▼    ▼    ▼    ▼    ▼
      Click Click Click Click Click
```

Ein **Observable** ist ein Stream von Ereignissen (Events, Werte, Actions) über die Zeit.

### Observable vs Promise

```typescript
// Promise - liefert EINEN Wert, einmal
const promise = fetch('/api/user');
promise.then(data => console.log(data));
// → { name: 'Alex' }
// ENDE. Promise ist "completed".

// Observable - liefert MEHRERE Werte über Zeit
const clicks$ = fromEvent(button, 'click');
clicks$.subscribe(event => console.log(event));
// → MouseEvent (bei Click 1)
// → MouseEvent (bei Click 2)
// → MouseEvent (bei Click 3)
// ... geht weiter!
```

**Unterschied:**
- **Promise:** Einmaliger Wert, dann fertig
- **Observable:** Stream von Werten über die Zeit

---

## 🔑 RxJS Grundlagen

### Observable erstellen

```typescript
import { Observable } from 'rxjs';

// Manuell erstellen
const numbers$ = new Observable(subscriber => {
  subscriber.next(1);      // Wert 1 emittieren
  subscriber.next(2);      // Wert 2 emittieren
  subscriber.next(3);      // Wert 3 emittieren
  subscriber.complete();   // Fertig
});

// Subscriben (= lauschen)
numbers$.subscribe({
  next: (value) => console.log(value),     // 1, 2, 3
  error: (err) => console.error(err),
  complete: () => console.log('Fertig!')
});
```

**Konvention:** Observables enden mit `$` (z.B. `clicks$`, `todos$`)

### Observable Operators

Operators transformieren Streams:

```typescript
import { of } from 'rxjs';
import { map, filter, delay } from 'rxjs/operators';

// Zahlen-Stream
const numbers$ = of(1, 2, 3, 4, 5);

// Transformieren mit map
numbers$
  .pipe(
    map(x => x * 2),           // Verdoppeln
    filter(x => x > 5),        // Nur > 5
  )
  .subscribe(console.log);     // 6, 8, 10
```

### Wichtige Operators

#### 1. `map` - Transformieren
```typescript
// Actions umwandeln
action$.pipe(
  map(action => action.payload)  // Nur Payload extrahieren
)
```

#### 2. `filter` - Filtern
```typescript
// Nur bestimmte Actions
action$.pipe(
  filter(action => action.type === 'LOGIN_REQUEST')
)
```

#### 3. `mergeMap` - Flatten (parallel)
```typescript
// API Call für jede Action
action$.pipe(
  mergeMap(action => 
    ajax.getJSON(`/api/users/${action.payload}`)
  )
)
```

#### 4. `switchMap` - Flatten (bricht vorherige ab)
```typescript
// Search: Nur neuester Request zählt
searchQuery$.pipe(
  switchMap(query => 
    ajax.getJSON(`/api/search?q=${query}`)
  )
)
```

#### 5. `debounceTime` - Warten
```typescript
// Warte 300ms nach letztem Event
input$.pipe(
  debounceTime(300),
  switchMap(value => api.search(value))
)
```

#### 6. `catchError` - Error Handling
```typescript
ajax.getJSON('/api/todos').pipe(
  catchError(error => of({ type: 'ERROR', payload: error }))
)
```

---

## 🏗️ Redux Observable Architektur

### Was ist ein Epic?

Ein **Epic** ist eine Function, die:
- Einen Stream von Actions nimmt (`action$`)
- Operationen darauf ausführt (transform, filter, API Calls)
- Einen neuen Stream von Actions zurückgibt

```typescript
const myEpic = (action$) => 
  action$.pipe(
    // ... Operationen
    map(result => newAction(result))
  );
```

**Epic = Action in, Action out**

### Der komplette Flow

```
1️⃣ Component
   │ dispatch(loginRequest({ email, password }))
   ▼
   
2️⃣ Redux Store
   │ Action geht durch alle Reducer
   │ State wird aktualisiert
   ▼
   
3️⃣ Redux Observable Middleware
   │ Action wird in action$ Stream eingespeist
   ▼
   
4️⃣ Epic (lauscht auf Stream)
   │ Filtert auf 'LOGIN_REQUEST'
   │ Macht API Call
   │ Gibt neue Action zurück
   ▼
   
5️⃣ Redux Store
   │ Epic-Action wird dispatched
   │ Reducer aktualisiert State
   ▼
   
6️⃣ Component
   │ Re-render mit neuem State
```

**Wichtig:** Actions gehen ERST durch Reducer, DANN durch Epics!

---

## 📦 Installation & Setup

### Installation

```bash
npm install redux-observable rxjs
```

### Store Setup

```typescript
// app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic } from './rootEpic';
import authReducer from '../features/auth/authSlice';
import todosReducer from '../features/todos/todosSlice';

// 1. Epic Middleware erstellen
const epicMiddleware = createEpicMiddleware();

// 2. Store mit Middleware konfigurieren
export const store = configureStore({
  reducer: {
    auth: authReducer,
    todos: todosReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(epicMiddleware),
});

// 3. Epics starten
epicMiddleware.run(rootEpic);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Root Epic

```typescript
// app/rootEpic.ts
import { combineEpics } from 'redux-observable';
import { loginEpic, registerEpic } from '../features/auth/authEpics';
import { fetchTodosEpic, createTodoEpic } from '../features/todos/todosEpics';

export const rootEpic = combineEpics(
  loginEpic,
  registerEpic,
  fetchTodosEpic,
  createTodoEpic,
  // ... weitere Epics
);
```

---

## 🎬 Komplettes Beispiel: Login Epic

### 1. Actions definieren

```typescript
// features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state, action: PayloadAction<LoginCredentials>) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { loginRequest, loginSuccess, loginFailure } = authSlice.actions;
export default authSlice.reducer;
```

### 2. Epic implementieren

```typescript
// features/auth/authEpics.ts
import { ofType } from 'redux-observable';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { of, from } from 'rxjs';
import { loginRequest, loginSuccess, loginFailure } from './authSlice';
import * as authService from '../../services/authService';

export const loginEpic = (action$) =>
  action$.pipe(
    // 1. Filter: Nur LOGIN_REQUEST Actions
    ofType(loginRequest.type),
    
    // 2. API Call für jede Action
    mergeMap((action) =>
      // Promise → Observable konvertieren
      from(authService.login(action.payload)).pipe(
        // 3. Success: Map zu SUCCESS Action
        map((response) =>
          loginSuccess({
            user: response.user,
            token: response.token,
          })
        ),
        // 4. Error: Map zu FAILURE Action
        catchError((error) =>
          of(loginFailure(error.response?.data?.error || 'Login fehlgeschlagen'))
        )
      )
    )
  );
```

**Was passiert hier?**

1. `ofType(loginRequest.type)` → Filtert Stream auf LOGIN_REQUEST Actions
2. `mergeMap` → Für jede Action einen API Call machen (parallel)
3. `from()` → Promise in Observable konvertieren
4. `map` → Success Response → loginSuccess Action
5. `catchError` → Error → loginFailure Action
6. Epic gibt Stream von Actions zurück → werden dispatched

### 3. Component Usage

```typescript
// components/Auth/LoginForm.tsx
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest } from '../../features/auth/authSlice';

function LoginForm() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Dispatche Action - Epic fängt sie ab!
    dispatch(loginRequest({
      email: 'user@example.com',
      password: 'password123',
    }));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {/* Form inputs... */}
    </form>
  );
}
```

---

## 🔥 Fortgeschrittene Patterns

### 1. Debounced Search

```typescript
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

export const searchEpic = (action$) =>
  action$.pipe(
    ofType('SEARCH_QUERY'),
    
    // Warte 300ms nach letzter Eingabe
    debounceTime(300),
    
    // Nur wenn Query sich geändert hat
    distinctUntilChanged(),
    
    // API Call (bricht vorherige ab!)
    switchMap((action) =>
      from(api.search(action.payload)).pipe(
        map((results) => searchSuccess(results)),
        catchError((error) => of(searchFailure(error.message)))
      )
    )
  );
```

**User tippt "Hello":**
```
H----e----l----l----o--------→
         (300ms Pause)
                      → API Call
```

### 2. Retry Logic

```typescript
import { retry, delay } from 'rxjs/operators';

export const fetchTodosEpic = (action$) =>
  action$.pipe(
    ofType('FETCH_TODOS_REQUEST'),
    mergeMap(() =>
      from(api.fetchTodos()).pipe(
        // Retry 3x bei Fehler, warte 1s zwischen Versuchen
        retry({ count: 3, delay: 1000 }),
        map((todos) => fetchTodosSuccess(todos)),
        catchError((error) => of(fetchTodosFailure(error.message)))
      )
    )
  );
```

### 3. Polling (regelmäßig aktualisieren)

```typescript
import { interval, race } from 'rxjs';
import { takeUntil, switchMap, mapTo } from 'rxjs/operators';

export const pollingEpic = (action$) =>
  action$.pipe(
    ofType('POLLING_START'),
    switchMap(() =>
      // Alle 5 Sekunden
      interval(5000).pipe(
        // Fetch Todos
        mapTo(fetchTodos()),
        // Stoppe bei POLLING_STOP Action
        takeUntil(action$.pipe(ofType('POLLING_STOP')))
      )
    )
  );
```

**Usage:**
```typescript
dispatch({ type: 'POLLING_START' });  // Start polling
// ... 5s → fetchTodos, 5s → fetchTodos, ...
dispatch({ type: 'POLLING_STOP' });   // Stop polling
```

### 4. Action Cancellation

```typescript
import { takeUntil, switchMap } from 'rxjs/operators';

export const fetchDataEpic = (action$) =>
  action$.pipe(
    ofType('FETCH_START'),
    switchMap(() =>
      from(api.fetchData()).pipe(
        map((data) => fetchSuccess(data)),
        // Brich ab bei FETCH_CANCEL
        takeUntil(action$.pipe(ofType('FETCH_CANCEL'))),
        catchError((error) => of(fetchFailure(error.message)))
      )
    )
  );
```

### 5. Race Condition (Timeout)

```typescript
import { race, timer } from 'rxjs';
import { mapTo } from 'rxjs/operators';

export const fetchWithTimeoutEpic = (action$) =>
  action$.pipe(
    ofType('FETCH_REQUEST'),
    switchMap(() =>
      race([
        // API Call
        from(api.fetchData()).pipe(
          map((data) => fetchSuccess(data))
        ),
        // Timeout nach 5 Sekunden
        timer(5000).pipe(
          mapTo(fetchTimeout())
        ),
      ]).pipe(
        catchError((error) => of(fetchFailure(error.message)))
      )
    )
  );
```

### 6. Chaining Actions

```typescript
export const loginAndFetchDataEpic = (action$) =>
  action$.pipe(
    ofType(loginSuccess.type),
    
    // Nach Login: Mehrere Actions dispatchen
    mergeMap(() => [
      fetchTodos(),
      fetchProfile(),
      fetchSettings(),
    ])
  );
```

### 7. Kombinieren mehrerer Streams

```typescript
import { combineLatest } from 'rxjs';

export const combinedEpic = (action$, state$) =>
  action$.pipe(
    ofType('CREATE_TODO'),
    
    // Kombiniere mit State
    combineLatest([action$, state$]),
    
    map(([action, state]) => {
      const user = state.auth.user;
      return createTodoWithUser({
        ...action.payload,
        userId: user.id,
      });
    })
  );
```

---

## 🆚 Observable vs Thunk vs Saga

| Feature | Thunk | Saga | Observable |
|---------|-------|------|------------|
| **Basis** | Promises | Generators | Streams |
| **Syntax** | Async/Await | yield | pipe/operators |
| **Lernkurve** | Flach ✅ | Mittel | Steil ❌ |
| **Cancellation** | ❌ Nein | ✅ Ja | ✅ Ja |
| **Debounce/Throttle** | ❌ Manuell | ❌ Manuell | ✅ Built-in |
| **Testbarkeit** | ❌ Schwer | ✅ Sehr gut | ✅ Gut |
| **Komplexe Flows** | ❌ Unübersichtlich | ✅ Strukturiert | ✅ Deklarativ |
| **Boilerplate** | ✅ Wenig | ❌ Viel | ❌ Mittel |
| **WebSocket/SSE** | ❌ Schwierig | ⚠️ Möglich | ✅ Perfekt |
| **Reaktive UI** | ❌ Nicht ideal | ⚠️ Möglich | ✅ Perfekt |

---

## 🎓 Wann Observable nutzen?

### ✅ Perfekt für Observable:

1. **Streams über Zeit**
   - WebSockets (Echtzeit-Daten)
   - Server-Sent Events (SSE)
   - Drag & Drop Events
   - Mouse Movements

2. **Debouncing/Throttling wichtig**
   - Search während Tippen
   - Auto-Save während Tippen
   - Scroll Events

3. **Komplexe Event-Kombinationen**
   - "Wenn A UND B passiert, dann C"
   - "Nach A warte auf B, aber max. 5 Sekunden"
   - Race Conditions

4. **Cancellation wichtig**
   - User kann Requests abbrechen
   - Nur neuester Request zählt
   - Timeout für lange Requests

5. **Reaktive Programmierung Fan**
   - Team kennt RxJS bereits
   - Reaktive Patterns bevorzugt

### ❌ Overkill für Observable:

1. **Einfache API Calls**
   - Standard CRUD Operations
   - Thunk ist einfacher

2. **Team kennt RxJS nicht**
   - Steilste Lernkurve
   - Operators schwer zu verstehen

3. **Kleine Apps**
   - Boilerplate nicht gerechtfertigt
   - Thunk ausreichend

4. **Keine Stream-ähnlichen Daten**
   - Einzelne Actions, keine Sequenzen
   - Promise reicht

---

## 🧪 Testing

### Epic testen

```typescript
import { TestScheduler } from 'rxjs/testing';
import { loginEpic } from './authEpics';
import { loginRequest, loginSuccess, loginFailure } from './authSlice';

describe('loginEpic', () => {
  let testScheduler: TestScheduler;
  
  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });
  
  it('dispatched loginSuccess bei erfolgreichem API Call', () => {
    testScheduler.run(({ hot, cold, expectObservable }) => {
      // Mock Action Stream
      const action$ = hot('-a', {
        a: loginRequest({ email: 'test@test.com', password: '123' }),
      });
      
      // Mock API Response
      const mockResponse = { user: { id: '1' }, token: 'abc' };
      
      // Epic ausführen
      const output$ = loginEpic(action$);
      
      // Erwartetes Ergebnis
      expectObservable(output$).toBe('-b', {
        b: loginSuccess(mockResponse),
      });
    });
  });
});
```

**Marble Diagrams:**
```
'-a'    = Nach 1 Frame: Action 'a'
'--b'   = Nach 2 Frames: Action 'b'
'-a-b-' = Frame 1: a, Frame 3: b
```

---

## 💡 RxJS Operator-Übersicht

### Creation Operators

```typescript
import { of, from, interval, fromEvent, timer } from 'rxjs';

of(1, 2, 3);                    // Werte emittieren
from([1, 2, 3]);                // Array → Observable
from(promise);                  // Promise → Observable
interval(1000);                 // Alle 1s einen Wert
fromEvent(button, 'click');     // DOM Events
timer(3000);                    // Nach 3s einen Wert
```

### Transformation Operators

```typescript
import { map, mergeMap, switchMap, concatMap, exhaustMap } from 'rxjs/operators';

// map - 1:1 Transformation
numbers$.pipe(map(x => x * 2));

// mergeMap - Flatten, parallel
action$.pipe(mergeMap(action => api.call()));

// switchMap - Flatten, vorherige abbrechen
search$.pipe(switchMap(query => api.search(query)));

// concatMap - Flatten, sequentiell warten
action$.pipe(concatMap(action => api.call()));

// exhaustMap - Flatten, neue ignorieren während laufend
click$.pipe(exhaustMap(() => api.call()));
```

### Filtering Operators

```typescript
import { filter, debounceTime, throttleTime, distinctUntilChanged } from 'rxjs/operators';

// filter - Nur bestimmte Werte
numbers$.pipe(filter(x => x > 5));

// debounceTime - Warte X ms nach letztem Wert
input$.pipe(debounceTime(300));

// throttleTime - Max. 1 Wert pro X ms
scroll$.pipe(throttleTime(100));

// distinctUntilChanged - Keine Duplikate hintereinander
input$.pipe(distinctUntilChanged());
```

### Combination Operators

```typescript
import { combineLatest, merge, concat, race, zip } from 'rxjs';

// combineLatest - Kombiniert neuesten Wert von allen
combineLatest([stream1$, stream2$]);

// merge - Merged alle Streams
merge(stream1$, stream2$);

// concat - Sequential hintereinander
concat(stream1$, stream2$);

// race - Ersten Wert gewinnt
race(api$, timeout$);

// zip - Warte auf allen, kombiniere
zip(stream1$, stream2$);
```

### Error Handling

```typescript
import { catchError, retry, retryWhen, delay } from 'rxjs/operators';

// catchError - Error fangen
api$.pipe(catchError(err => of({ error: err })));

// retry - X mal wiederholen
api$.pipe(retry(3));

// retryWhen - Conditional retry mit delay
api$.pipe(
  retryWhen(errors => errors.pipe(delay(1000)))
);
```

---

## 📚 Zusammenfassung

### Redux Observable in einem Satz:
**Redux Observable nutzt RxJS Observables und Streams, um asynchrone Actions reaktiv und deklarativ zu handhaben – perfekt für komplexe Event-Sequenzen und Echtzeit-Daten.**

### Die 5 Kernkonzepte:

1. **Observables** - Streams von Werten über die Zeit
2. **Operators** - Transformieren, filtern, kombinieren von Streams
3. **Epics** - Functions die Action-Streams transformieren
4. **Reaktive Programmierung** - Deklarativ beschreiben statt imperativ steuern
5. **Marble Diagrams** - Visualisierung von Streams für Testing

### Wann Observable nutzen?

- ✅ WebSockets / Server-Sent Events
- ✅ Komplexe Event-Sequenzen
- ✅ Debouncing/Throttling wichtig
- ✅ Cancellation/Timeout wichtig
- ✅ Team kennt RxJS
- ❌ Einfache CRUD (→ Thunk)
- ❌ Team kennt RxJS nicht (→ Thunk/Saga)
- ❌ Kleine Apps (→ Thunk)

### Die Stream-Philosophie:

**"Alles ist ein Stream"**
- User Inputs → Stream
- API Responses → Stream
- WebSocket Messages → Stream
- Timer Events → Stream
- Redux Actions → Stream

**Deklarativ statt Imperativ:**
```typescript
// Imperativ (wie)
let result;
if (user.loggedIn) {
  result = await api.fetch();
}

// Deklarativ (was)
action$.pipe(
  filter(isLoggedIn),
  switchMap(() => from(api.fetch()))
)
```

---

## 🎯 Next Steps

1. Lies das Tutorial: `OBSERVABLE_TUTORIAL.md`
2. Lerne RxJS Basics: https://rxjs.dev/
3. Marble Diagrams verstehen: https://rxmarbles.com/
4. Implementiere einfachen Epic (Login)
5. Experimentiere mit Operators (debounce, switchMap)
6. Baue WebSocket Integration

**Redux Observable ist mächtig, aber komplex. RxJS ist ein eigenes Universum! 🌊🚀**

---

## 📖 Ressourcen

- **RxJS Dokumentation:** https://rxjs.dev/
- **RxJS Marbles (Interaktiv):** https://rxmarbles.com/
- **Learn RxJS:** https://www.learnrxjs.io/
- **Redux Observable Docs:** https://redux-observable.js.org/
- **RxJS Operator Decision Tree:** https://rxjs.dev/operator-decision-tree
