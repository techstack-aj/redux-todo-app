# ⚙️ Redux Middleware - Theoretische Grundlagen

## Was ist Middleware?

**Middleware** ist eine **Erweiterungsschicht** zwischen dem Dispatchen einer Action und dem Moment, in dem sie den Reducer erreicht. Sie ermöglicht es, Actions zu **intercepten, modifizieren, verzögern oder komplett abzufangen**.

Stell dir Middleware wie einen **Filter** oder **Tunnel** vor, durch den jede Action durchlaufen muss:

```
Component
   │ dispatch(action)
   ▼
┌─────────────────┐
│  Middleware 1   │ ← Logger
├─────────────────┤
│  Middleware 2   │ ← Thunk
├─────────────────┤
│  Middleware 3   │ ← Saga
└────────┬────────┘
         ▼
     Reducer(s)
         │
         ▼
    State Update
         │
         ▼
     Component
```

---

## 🎯 Warum Middleware?

### Das Problem ohne Middleware

```typescript
// Component
dispatch({ type: 'ADD_TODO', payload: 'Einkaufen' });

// Reducer
const todosReducer = (state, action) => {
  // ❌ Kein Logging
  // ❌ Kein async Code
  // ❌ Keine Validierung
  // ❌ Keine Transformation
  
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, action.payload];
  }
};
```

**Problem:** Wo soll Code hin für:
- 📝 Logging (alle Actions protokollieren)
- ⏱️ Asynchrone Operations (API Calls)
- ✅ Validierung (Action-Schema prüfen)
- 🔄 Transformation (Action umwandeln)
- 🐛 Error Handling
- 📊 Analytics

### Die Lösung: Middleware

Middleware kann **alles machen** bevor die Action zum Reducer kommt:

```typescript
const loggerMiddleware = (store) => (next) => (action) => {
  console.log('Action:', action);           // Logging
  const result = next(action);              // Weiterleiten
  console.log('New State:', store.getState()); // State nach Action
  return result;
};
```

---

## 🏗️ Middleware Architektur

### Die Middleware-Signatur

```typescript
const middleware = (store) => (next) => (action) => {
  // Dein Code hier
  return next(action);
};
```

**Drei verschachtelte Functions (Currying):**

```typescript
// 1. Äußere Function - bekommt Store
(store) => {
  // store.getState() - aktuellen State lesen
  // store.dispatch() - neue Action dispatchen
  
  // 2. Mittlere Function - bekommt next
  return (next) => {
    // next(action) - nächste Middleware oder Reducer aufrufen
    
    // 3. Innere Function - bekommt Action
    return (action) => {
      // Hier passiert die Magie!
      return next(action);
    };
  };
};
```

**Warum Currying?**
- `store` → Zugriff auf State und Dispatch
- `next` → Weiterleitung an nächste Middleware
- `action` → Die zu verarbeitende Action

### Der Flow

```
dispatch(action)
       │
       ▼
  Middleware 1
       │ next(action)
       ▼
  Middleware 2
       │ next(action)
       ▼
  Middleware 3
       │ next(action)
       ▼
    Reducer
       │
       ▼
  State Update
       │
       ▼
  return → Middleware 3
       │
       ▼
  return → Middleware 2
       │
       ▼
  return → Middleware 1
       │
       ▼
  return → Component
```

---

## 📦 Middleware Beispiele

### 1. Logger Middleware (einfachstes Beispiel)

```typescript
const loggerMiddleware = (store) => (next) => (action) => {
  console.group(action.type);
  console.log('Previous State:', store.getState());
  console.log('Action:', action);
  
  // Action weiterleiten
  const result = next(action);
  
  console.log('Next State:', store.getState());
  console.groupEnd();
  
  return result;
};
```

**Output:**
```
▼ ADD_TODO
  Previous State: { todos: [] }
  Action: { type: 'ADD_TODO', payload: 'Einkaufen' }
  Next State: { todos: ['Einkaufen'] }
```

### 2. Crash Reporter Middleware

```typescript
const crashReporterMiddleware = (store) => (next) => (action) => {
  try {
    // Action normal weiterleiten
    return next(action);
  } catch (error) {
    // Error fangen und an Service senden
    console.error('Redux Error:', error);
    
    // An Error-Tracking Service senden (z.B. Sentry)
    errorTrackingService.captureException(error, {
      extra: {
        action,
        state: store.getState(),
      },
    });
    
    // Error weiterwerfen
    throw error;
  }
};
```

### 3. Thunk Middleware (vereinfacht)

```typescript
const thunkMiddleware = (store) => (next) => (action) => {
  // Ist die Action eine Function?
  if (typeof action === 'function') {
    // Ja → Führe Function aus mit dispatch & getState
    return action(store.dispatch, store.getState);
  }
  
  // Nein → Normale Action → weiterleiten
  return next(action);
};
```

**Ermöglicht:**
```typescript
dispatch((dispatch, getState) => {
  dispatch({ type: 'LOADING' });
  fetch('/api/todos')
    .then(data => dispatch({ type: 'SUCCESS', payload: data }));
});
```

### 4. Promise Middleware

```typescript
const promiseMiddleware = (store) => (next) => (action) => {
  // Ist die Action ein Promise?
  if (action.payload instanceof Promise) {
    // Ja → Warte auf Promise
    return action.payload
      .then((result) => {
        // Dispatche Action mit resolved value
        store.dispatch({
          ...action,
          payload: result,
        });
      })
      .catch((error) => {
        // Dispatche Error Action
        store.dispatch({
          type: `${action.type}_ERROR`,
          payload: error,
          error: true,
        });
      });
  }
  
  // Nein → Normale Action → weiterleiten
  return next(action);
};
```

**Ermöglicht:**
```typescript
dispatch({
  type: 'FETCH_TODOS',
  payload: fetch('/api/todos').then(res => res.json()),
});
```

### 5. Validation Middleware

```typescript
const validationMiddleware = (store) => (next) => (action) => {
  // Prüfe Action-Schema
  if (!action.type) {
    console.error('Action muss "type" haben!', action);
    return; // Action blockieren
  }
  
  // Prüfe Action-Type Format
  if (typeof action.type !== 'string') {
    console.error('Action type muss String sein!', action);
    return;
  }
  
  // Alles ok → weiterleiten
  return next(action);
};
```

### 6. Local Storage Middleware

```typescript
const localStorageMiddleware = (store) => (next) => (action) => {
  // Action normal weiterleiten
  const result = next(action);
  
  // Nach Action: State in localStorage speichern
  const state = store.getState();
  
  try {
    localStorage.setItem('redux-state', JSON.stringify({
      todos: state.todos,
      // Nur bestimmte Teile speichern
    }));
  } catch (error) {
    console.error('localStorage Error:', error);
  }
  
  return result;
};
```

### 7. Analytics Middleware

```typescript
const analyticsMiddleware = (store) => (next) => (action) => {
  // Tracking-relevante Actions
  const trackableActions = [
    'auth/login',
    'todos/create',
    'todos/delete',
  ];
  
  if (trackableActions.includes(action.type)) {
    // Sende Event an Analytics Service
    analytics.track(action.type, {
      payload: action.payload,
      userId: store.getState().auth.user?.id,
    });
  }
  
  return next(action);
};
```

### 8. Debounce Middleware

```typescript
const debounceMiddleware = (store) => {
  const timers = {};
  
  return (next) => (action) => {
    // Nur bestimmte Actions debounced
    if (action.meta?.debounce) {
      const { debounce } = action.meta;
      
      // Lösche alten Timer
      if (timers[action.type]) {
        clearTimeout(timers[action.type]);
      }
      
      // Neuer Timer
      timers[action.type] = setTimeout(() => {
        next(action);
        delete timers[action.type];
      }, debounce);
      
      return; // Blockiere Action erstmal
    }
    
    // Normale Action → sofort weiterleiten
    return next(action);
  };
};
```

**Ermöglicht:**
```typescript
dispatch({
  type: 'SEARCH',
  payload: 'query',
  meta: { debounce: 300 }, // Warte 300ms
});
```

---

## 🔧 Middleware Setup

### Mit Redux Toolkit (empfohlen)

```typescript
import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import {thunk} from 'redux-thunk';

export const store = configureStore({
  reducer: {
    todos: todosReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(logger)
      .concat(thunk),
});
```

**`getDefaultMiddleware()` enthält bereits:**
- ✅ `redux-thunk`
- ✅ Immutability Check (Development)
- ✅ Serializability Check (Development)

### Manuell mit Redux

```typescript
import { createStore, applyMiddleware, compose } from 'redux';
import {thunk} from 'redux-thunk';
import logger from 'redux-logger';
import rootReducer from './reducers';

const middleware = [thunk, logger, crashReporter];

// Mit Redux DevTools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(...middleware))
);
```

### Eigene Middleware hinzufügen

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { loggerMiddleware, analyticsMiddleware } from './middleware';

export const store = configureStore({
  reducer: { /* ... */ },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(loggerMiddleware)
      .concat(analyticsMiddleware),
});
```

---

## 🎬 Komplettes Beispiel: API Middleware

### API Middleware für standardisierte API Calls

```typescript
// middleware/apiMiddleware.ts
const apiMiddleware = (store) => (next) => (action) => {
  // Nur API Actions verarbeiten
  if (!action.meta?.api) {
    return next(action);
  }
  
  const { url, method = 'GET', body, onSuccess, onError } = action.meta.api;
  
  // START Action dispatchen
  store.dispatch({
    type: `${action.type}_START`,
  });
  
  // API Call
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${store.getState().auth.token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      // SUCCESS Action dispatchen
      store.dispatch({
        type: `${action.type}_SUCCESS`,
        payload: data,
      });
      
      // Optional: Callback
      if (onSuccess) onSuccess(data);
    })
    .catch((error) => {
      // ERROR Action dispatchen
      store.dispatch({
        type: `${action.type}_ERROR`,
        payload: error.message,
        error: true,
      });
      
      // Optional: Callback
      if (onError) onError(error);
    });
};
```

### Usage

```typescript
// Action Creator
export const fetchTodos = () => ({
  type: 'FETCH_TODOS',
  meta: {
    api: {
      url: '/api/todos',
      method: 'GET',
      onSuccess: (data) => console.log('Todos geladen:', data),
      onError: (error) => console.error('Fehler:', error),
    },
  },
});

// Component
dispatch(fetchTodos());

// Middleware dispatched automatisch:
// 1. { type: 'FETCH_TODOS_START' }
// 2. { type: 'FETCH_TODOS_SUCCESS', payload: [...] }
// oder
// 2. { type: 'FETCH_TODOS_ERROR', payload: 'Error message' }
```

---

## 🔥 Fortgeschrittene Middleware Patterns

### 1. Middleware Chain (mehrere Middleware kombinieren)

```typescript
const middleware1 = (store) => (next) => (action) => {
  console.log('Middleware 1: Before');
  const result = next(action);
  console.log('Middleware 1: After');
  return result;
};

const middleware2 = (store) => (next) => (action) => {
  console.log('Middleware 2: Before');
  const result = next(action);
  console.log('Middleware 2: After');
  return result;
};

// Setup
applyMiddleware(middleware1, middleware2);

// Output bei dispatch:
// Middleware 1: Before
// Middleware 2: Before
// [Reducer]
// Middleware 2: After
// Middleware 1: After
```

### 2. Conditional Middleware

```typescript
const conditionalMiddleware = (store) => (next) => (action) => {
  const state = store.getState();
  
  // Nur wenn User eingeloggt
  if (action.meta?.requiresAuth && !state.auth.user) {
    console.warn('Action requires auth!');
    return store.dispatch(redirectToLogin());
  }
  
  return next(action);
};
```

### 3. Action Transformation

```typescript
const transformMiddleware = (store) => (next) => (action) => {
  // Action umwandeln vor Reducer
  if (action.type === 'OLD_ACTION') {
    return next({
      type: 'NEW_ACTION',
      payload: transformPayload(action.payload),
    });
  }
  
  return next(action);
};
```

### 4. Multi-Dispatch Middleware

```typescript
const multiDispatchMiddleware = (store) => (next) => (action) => {
  // Array von Actions?
  if (Array.isArray(action)) {
    return action.forEach((a) => store.dispatch(a));
  }
  
  return next(action);
};

// Usage
dispatch([
  { type: 'ACTION_1' },
  { type: 'ACTION_2' },
  { type: 'ACTION_3' },
]);
```

### 5. Rate Limiting Middleware

```typescript
const rateLimitMiddleware = (store) => {
  const limits = {};
  
  return (next) => (action) => {
    if (action.meta?.rateLimit) {
      const { type } = action;
      const { limit, window } = action.meta.rateLimit;
      
      // Initialisiere Tracking
      if (!limits[type]) {
        limits[type] = { count: 0, resetAt: Date.now() + window };
      }
      
      // Reset wenn Fenster abgelaufen
      if (Date.now() > limits[type].resetAt) {
        limits[type] = { count: 0, resetAt: Date.now() + window };
      }
      
      // Limit erreicht?
      if (limits[type].count >= limit) {
        console.warn(`Rate limit exceeded for ${type}`);
        return; // Blockiere Action
      }
      
      limits[type].count++;
    }
    
    return next(action);
  };
};

// Usage
dispatch({
  type: 'SEND_MESSAGE',
  payload: 'Hello',
  meta: { rateLimit: { limit: 5, window: 60000 } }, // Max 5 in 60s
});
```

---

## 🆚 Middleware vs Enhancers vs Reducer

| | Middleware | Enhancer | Reducer |
|---|-----------|----------|---------|
| **Wann** | Zwischen dispatch und Reducer | Bei Store-Erstellung | Nach Middleware |
| **Zweck** | Actions intercepten | Store-Funktionalität erweitern | State aktualisieren |
| **Kann** | dispatch, getState, next | Store-API ändern | State ändern |
| **Beispiele** | Thunk, Saga, Logger | DevTools, Persistenz | Alle Reducer |

---

## 🎓 Wann eigene Middleware schreiben?

### ✅ Gute Use Cases:

1. **Cross-Cutting Concerns**
   - Logging für alle Actions
   - Error Tracking
   - Analytics

2. **Action Transformation**
   - Normalisierung
   - Validierung
   - Backwards Compatibility

3. **Side Effects Patterns**
   - API Calls mit Standard-Pattern
   - WebSocket Integration
   - LocalStorage Sync

4. **Performance**
   - Debouncing
   - Throttling
   - Rate Limiting

5. **Development Tools**
   - Action History
   - Time Travel
   - State Snapshots

### ❌ Wann KEINE Middleware:

1. **Action-spezifische Logik**
   - Gehört in Thunk/Saga
   - Nicht in generische Middleware

2. **State-Transformation**
   - Gehört in Reducer
   - Nicht in Middleware

3. **Component-Logik**
   - Gehört in Component
   - Nicht in Middleware

---

## 🧪 Middleware Testing

### Middleware testen

```typescript
// middleware/logger.test.ts
import { loggerMiddleware } from './logger';

describe('loggerMiddleware', () => {
  it('logged Action und State', () => {
    const store = {
      getState: jest.fn(() => ({ todos: [] })),
      dispatch: jest.fn(),
    };
    const next = jest.fn();
    const action = { type: 'ADD_TODO', payload: 'Test' };
    
    // Middleware ausführen
    const invoke = loggerMiddleware(store)(next);
    invoke(action);
    
    // next wurde aufgerufen
    expect(next).toHaveBeenCalledWith(action);
    
    // getState wurde aufgerufen (für Logging)
    expect(store.getState).toHaveBeenCalled();
  });
  
  it('gibt Result von next zurück', () => {
    const store = { getState: jest.fn(), dispatch: jest.fn() };
    const next = jest.fn(() => 'next-result');
    const action = { type: 'TEST' };
    
    const invoke = loggerMiddleware(store)(next);
    const result = invoke(action);
    
    expect(result).toBe('next-result');
  });
});
```

---

## 💡 Best Practices

### 1. Immer `next()` aufrufen

```typescript
// ❌ FALSCH - Action wird blockiert!
const badMiddleware = (store) => (next) => (action) => {
  console.log(action);
  // next() fehlt!
};

// ✅ RICHTIG
const goodMiddleware = (store) => (next) => (action) => {
  console.log(action);
  return next(action); // Wichtig!
};
```

### 2. Return Value von `next()`

```typescript
const middleware = (store) => (next) => (action) => {
  // Do stuff...
  const result = next(action);
  // Do more stuff...
  return result; // Für dispatch() Return Value
};
```

### 3. Fehler weiterwerfen

```typescript
const middleware = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    // Logging/Reporting
    console.error(error);
    // Weiterwerfen!
    throw error;
  }
};
```

### 4. Reihenfolge beachten

```typescript
// Logger sollte als letztes, um alle Actions zu sehen
configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(thunk)      // Zuerst
      .concat(saga)       // Dann
      .concat(logger),    // Zuletzt
});
```

### 5. Type-Safety mit TypeScript

```typescript
import { Middleware } from '@reduxjs/toolkit';
import { RootState } from './store';

export const myMiddleware: Middleware<{}, RootState> = 
  (store) => (next) => (action) => {
    // Type-safe store.getState()
    const state = store.getState();
    return next(action);
  };
```

---

## 📚 Zusammenfassung

### Redux Middleware in einem Satz:
**Middleware ist eine Erweiterungsschicht zwischen dispatch und Reducer, die Actions intercepten, modifizieren, verzögern oder erweitern kann.**

### Die 3 Kernkonzepte:

1. **Intercept Point** - Zwischen dispatch und Reducer
   ```
   dispatch → Middleware → Reducer → State
   ```

2. **Currying-Signatur** - `(store) => (next) => (action) => {}`
   - `store` - getState, dispatch
   - `next` - Nächste Middleware/Reducer
   - `action` - Die zu verarbeitende Action

3. **next() aufrufen** - Action weiterleiten
   ```typescript
   return next(action); // Wichtig!
   ```

### Beliebte Middleware:

- **redux-thunk** - Async Actions mit Functions
- **redux-saga** - Async Actions mit Generators
- **redux-observable** - Async Actions mit Observables
- **redux-logger** - Logging aller Actions
- **redux-persist** - State in LocalStorage

### Wann eigene Middleware?

- ✅ Cross-Cutting Concerns (Logging, Analytics)
- ✅ Action Transformation (Validierung)
- ✅ Side Effects Patterns (API standardisieren)
- ✅ Performance (Debouncing, Rate Limiting)
- ❌ Action-spezifische Logik (→ Thunk/Saga)
- ❌ State-Transformation (→ Reducer)

---

## 🎯 Next Steps

1. Verstehe die drei populären Middleware:
   - `REDUX_THUNK_THEORIE.md`
   - `REDUX_SAGA_THEORIE.md`
   - `REDUX_OBSERVABLE_THEORIE.md`

2. Schreibe eigene einfache Middleware:
   - Logger
   - Analytics
   - Error Tracker

3. Nutze Redux DevTools (ist auch eine Middleware!)

4. Experimentiere mit Middleware-Reihenfolge

**Middleware ist der Schlüssel zur Erweiterung von Redux! ⚙️🚀**

---

## 🔗 Populäre Middleware-Bibliotheken

### Async Actions
- **redux-thunk** - Promises/Async-Await
- **redux-saga** - Generators/Effects
- **redux-observable** - RxJS Observables
- **redux-promise** - Promise Middleware
- **redux-promise-middleware** - FSA-compliant Promises

### Development
- **redux-logger** - Action/State Logging
- **redux-devtools-extension** - Time Travel Debugging
- **redux-immutable-state-invariant** - Immutability Check

### Persistence
- **redux-persist** - LocalStorage/AsyncStorage
- **redux-storage** - Storage Engine

### Performance
- **redux-debounced** - Debouncing
- **redux-batch-actions** - Batch Multiple Actions

### Networking
- **redux-api-middleware** - Standardized API Calls
- **redux-axios-middleware** - Axios Integration

### Forms
- **redux-form** - Form State Management (deprecated, use Formik)

### Offline
- **redux-offline** - Offline-First Apps
- **@redux-offline/redux-offline** - Maintained Fork
