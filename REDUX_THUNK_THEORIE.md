# ⚡ Redux Thunk - Theoretische Grundlagen

## Was ist Redux Thunk?

Redux Thunk ist die **einfachste und beliebteste Middleware** für Redux, um **asynchrone Logik** zu handhaben. Der Name "Thunk" kommt aus der funktionalen Programmierung und bedeutet: **Eine Funktion, die eine andere Funktion zurückgibt, um die Ausführung zu verzögern**.

Statt nur plain objects als Actions zu dispatchen, erlaubt Redux Thunk das Dispatchen von **Funktionen**. Diese Funktionen bekommen `dispatch` und `getState` als Parameter und können dann asynchrone Operationen ausführen.

---

## 🎯 Das Problem ohne Thunk

### Normales Redux: Nur synchrone Actions

```typescript
// ✅ Das geht - Plain Object Action
const addTodo = (text: string) => ({
  type: 'ADD_TODO',
  payload: { text }
});

dispatch(addTodo('Einkaufen'));
```

```typescript
// ❌ Das geht NICHT - Asynchroner Code
const fetchTodos = () => {
  // Wo soll der API Call hin?
  fetch('/api/todos')
    .then(data => dispatch({ type: 'SUCCESS', payload: data }));
  // dispatch ist hier nicht verfügbar!
  
  return { type: 'FETCH_TODOS' }; // ???
};
```

**Problem:** 
- Redux Actions sind synchron
- Reducer müssen pure functions sein (keine Side Effects)
- Wohin mit API Calls, Timeouts, localStorage?

### Schlechte Lösungen

**1. Asynchroner Code im Component**
```typescript
function TodoList() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // ❌ Business Logic im Component!
    fetch('/api/todos')
      .then(res => res.json())
      .then(data => dispatch({ type: 'SUCCESS', payload: data }))
      .catch(err => dispatch({ type: 'ERROR', payload: err }));
  }, []);
}
```

**Probleme:**
- Business Logic gehört nicht in UI Components
- Nicht wiederverwendbar
- Schwer zu testen
- Überall duplizierter Code

**2. Side Effects im Reducer**
```typescript
// ❌ NIEMALS SO MACHEN!
const todosReducer = (state, action) => {
  if (action.type === 'FETCH_TODOS') {
    fetch('/api/todos').then(...); // ❌ Side Effect!
    return state;
  }
}
```

**Problem:** Reducer müssen pure sein!

---

## ✅ Die Lösung: Redux Thunk

Redux Thunk erlaubt das Dispatchen von **Functions statt Objects**.

### Was ist ein Thunk?

```typescript
// Normale Function - wird sofort ausgeführt
const add = (a, b) => a + b;
add(2, 3); // 5 sofort

// Thunk - Function die Function zurückgibt - verzögerte Ausführung
const addThunk = (a, b) => {
  return () => a + b; // Funktion zurückgeben
};

const delayed = addThunk(2, 3); // Nichts passiert!
delayed(); // Jetzt erst: 5
```

**Thunk = Verzögerte Ausführung**

### Redux Thunk in Aktion

```typescript
// Normale Action (Plain Object)
const addTodo = (text: string) => ({
  type: 'ADD_TODO',
  payload: { text }
});

// Thunk Action (Function)
const fetchTodos = () => {
  return async (dispatch, getState) => {
    // Hier können wir asynchronen Code schreiben!
    dispatch({ type: 'LOADING' });
    
    try {
      const response = await fetch('/api/todos');
      const data = await response.json();
      dispatch({ type: 'SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'ERROR', payload: error.message });
    }
  };
};

// Usage im Component
dispatch(fetchTodos()); // Dispatche die Function!
```

---

## 🏗️ Wie funktioniert Redux Thunk?

### Der Flow ohne Thunk

```
Component
   │ dispatch({ type: 'ADD_TODO', payload: {...} })
   ▼
Redux Store
   │ Action ist ein Object ✅
   ▼
Reducer
   │ state = reducer(state, action)
   ▼
Component
   │ Re-render
```

### Der Flow mit Thunk

```
Component
   │ dispatch(fetchTodos())  // Function!
   ▼
Redux Thunk Middleware
   │ Prüft: Ist action eine Function?
   │ ✅ Ja → Führe Function aus mit (dispatch, getState)
   ▼
Thunk Function
   │ async (dispatch, getState) => {
   │   await fetch('/api/todos');
   │   dispatch({ type: 'SUCCESS', payload: data });
   │ }
   ▼
Redux Store
   │ Action ist jetzt ein Object ✅
   ▼
Reducer
   │ state = reducer(state, action)
   ▼
Component
   │ Re-render
```

**Der Clou:** Thunk Middleware fängt Functions ab und führt sie aus!

---

## 📦 Installation & Setup

### Installation

```bash
npm install @reduxjs/toolkit
# oder
npm install redux-thunk
```

**Hinweis:** Redux Toolkit enthält Thunk bereits!

### Store Setup

```typescript
// Mit Redux Toolkit (empfohlen)
import { configureStore } from '@reduxjs/toolkit';
import todosReducer from './features/todos/todosSlice';

export const store = configureStore({
  reducer: {
    todos: todosReducer,
  },
  // Thunk ist bereits aktiviert! ✅
});
```

```typescript
// Manuell mit Redux (ohne Toolkit)
import { createStore, applyMiddleware } from 'redux';
import {thunk} from 'redux-thunk';
import rootReducer from './reducers';

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);
```

---

## 🎬 Komplettes Beispiel: Todos fetchen

### 1. Slice mit synchronen Actions

```typescript
// features/todos/todosSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TodosState {
  items: Todo[];
  loading: boolean;
  error: string | null;
}

const initialState: TodosState = {
  items: [],
  loading: false,
  error: null,
};

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // Synchrone Actions
    fetchTodosStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTodosSuccess: (state, action: PayloadAction<Todo[]>) => {
      state.loading = false;
      state.items = action.payload;
    },
    fetchTodosFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchTodosStart,
  fetchTodosSuccess,
  fetchTodosFailure,
} = todosSlice.actions;

export default todosSlice.reducer;
```

### 2. Thunk definieren

```typescript
// features/todos/todosThunks.ts
import { AppDispatch, RootState } from '../../app/store';
import { fetchTodosStart, fetchTodosSuccess, fetchTodosFailure } from './todosSlice';
import * as todoService from '../../services/todoService';

// Thunk Action Creator
export const fetchTodos = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      // 1. Loading State
      dispatch(fetchTodosStart());
      
      // 2. API Call (async!)
      const todos = await todoService.fetchTodos();
      
      // 3. Success Action
      dispatch(fetchTodosSuccess(todos));
      
      console.log('✅ Todos geladen');
    } catch (error: any) {
      // 4. Error Action
      const message = error.response?.data?.error || 'Fehler beim Laden';
      dispatch(fetchTodosFailure(message));
      console.error('❌ Fehler:', message);
    }
  };
};
```

**Struktur eines Thunks:**
```typescript
const myThunk = (params) => {
  return async (dispatch, getState) => {
    // Hier asynchrone Logik
    // dispatch() aufrufen für Actions
    // getState() für aktuellen State
  };
};
```

### 3. Thunk mit Parametern

```typescript
export const createTodo = (text: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(createTodoStart());
      
      const newTodo = await todoService.createTodo({ text });
      
      dispatch(createTodoSuccess(newTodo));
    } catch (error: any) {
      dispatch(createTodoFailure(error.message));
    }
  };
};
```

### 4. Component Integration

```typescript
// components/Todos/TodoList.tsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTodos } from '../../features/todos/todosThunks';
import { RootState } from '../../app/store';

function TodoList() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state: RootState) => state.todos);
  
  useEffect(() => {
    // Dispatche Thunk beim Mount
    dispatch(fetchTodos());
  }, [dispatch]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <ul>
      {items.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

---

## 🔥 Fortgeschrittene Patterns

### 1. Thunk mit Conditional Dispatch

```typescript
export const fetchTodosIfNeeded = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const { todos } = getState();
    
    // Nur fetchen wenn noch nicht geladen
    if (todos.items.length === 0 && !todos.loading) {
      dispatch(fetchTodos());
    }
  };
};
```

### 2. Optimistic Updates

```typescript
export const toggleTodo = (id: string) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const todos = getState().todos.items;
    const todo = todos.find(t => t.id === id);
    
    if (!todo) return;
    
    // 1. Optimistic Update (sofort UI aktualisieren)
    dispatch(toggleTodoOptimistic(id));
    
    try {
      // 2. API Call
      await todoService.updateTodo(id, { completed: !todo.completed });
      
      // 3. Bestätigung (optional)
      dispatch(toggleTodoSuccess(id));
    } catch (error) {
      // 4. Rollback bei Fehler
      dispatch(toggleTodoRollback(id));
      dispatch(showError('Update fehlgeschlagen'));
    }
  };
};
```

### 3. Chaining Thunks

```typescript
export const loginAndFetchData = (credentials: LoginCredentials) => {
  return async (dispatch: AppDispatch) => {
    try {
      // 1. Login
      await dispatch(loginThunk(credentials));
      
      // 2. Nach Login: Daten laden
      await dispatch(fetchTodos());
      await dispatch(fetchProfile());
      
      console.log('✅ Login und Daten geladen');
    } catch (error) {
      console.error('❌ Fehler:', error);
    }
  };
};
```

### 4. Error Handling mit Retry

```typescript
export const fetchTodosWithRetry = (retries = 3) => {
  return async (dispatch: AppDispatch) => {
    dispatch(fetchTodosStart());
    
    for (let i = 0; i < retries; i++) {
      try {
        const todos = await todoService.fetchTodos();
        dispatch(fetchTodosSuccess(todos));
        return; // Erfolg → raus
      } catch (error) {
        if (i === retries - 1) {
          // Letzter Versuch fehlgeschlagen
          dispatch(fetchTodosFailure('Fehler nach 3 Versuchen'));
        } else {
          // Warte und versuche erneut
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  };
};
```

### 5. Progress Tracking

```typescript
export const uploadFile = (file: File) => {
  return async (dispatch: AppDispatch) => {
    dispatch(uploadStart());
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        // Progress Event
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          dispatch(uploadProgress(percent));
        },
      });
      
      dispatch(uploadSuccess(await response.json()));
    } catch (error) {
      dispatch(uploadFailure(error.message));
    }
  };
};
```

---

## 🆚 Thunk vs andere Lösungen

### Thunk vs Saga

| Feature | Thunk | Saga |
|---------|-------|------|
| **Syntax** | Async/Await ✅ | Generators (yield) ❌ |
| **Lernkurve** | Flach ✅ | Steil ❌ |
| **Boilerplate** | Wenig ✅ | Viel ❌ |
| **Testbarkeit** | Schwer ❌ | Sehr gut ✅ |
| **Cancellation** | Nein ❌ | Ja ✅ |
| **Komplexe Flows** | Unübersichtlich ❌ | Strukturiert ✅ |
| **Debugging** | Stack Traces ✅ | Komplexer ❌ |

### Thunk vs Component Logic

```typescript
// ❌ Component Logic (schlecht)
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/todos')
      .then(res => res.json())
      .then(setTodos)
      .finally(() => setLoading(false));
  }, []);
}

// ✅ Thunk (gut)
function TodoList() {
  const dispatch = useDispatch();
  const todos = useSelector(state => state.todos);
  
  useEffect(() => {
    dispatch(fetchTodos());
  }, []);
}
```

**Vorteile Thunk:**
- ✅ Business Logic zentral
- ✅ Wiederverwendbar
- ✅ Testbar
- ✅ Redux State Management

---

## 🎓 Wann Thunk nutzen?

### ✅ Perfekt für Thunk:

1. **Einfache bis mittlere Komplexität**
   - CRUD Operations
   - API Calls mit Loading/Error States
   - Sequentielle asynchrone Actions

2. **Schnelle Entwicklung**
   - Wenig Boilerplate
   - Async/Await Syntax (bekannt)
   - Schnell implementiert

3. **Kleine bis mittlere Apps**
   - Nicht zu viele asynchrone Flows
   - Standard Use Cases

4. **Team-Constraints**
   - Team kennt Async/Await
   - Keine Zeit für Saga/Observable
   - Einfacher zu erklären

### ❌ Limitations von Thunk:

1. **Schwer testbar**
   - Mocks für API Calls nötig
   - Nicht pure (Side Effects)

2. **Nicht cancellable**
   - Laufende Requests können nicht abgebrochen werden
   - Race Conditions möglich

3. **Komplexe Flows unübersichtlich**
   - Viele verschachtelte Promises
   - Error Handling wird komplex
   - Schwer zu debuggen

4. **Keine Orchestration**
   - Schwierig: "Warte auf 2 Actions, dann mach X"
   - Keine nativen Patterns für Retry/Debounce/Polling

---

## 🧪 Testing

### Thunk testen (mit Mocks)

```typescript
// todosThunks.test.ts
import configureMockStore from 'redux-mock-store';
import {thunk} from 'redux-thunk';
import { fetchTodos } from './todosThunks';
import * as todoService from '../../services/todoService';

// Mock Store Setup
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// Mock API Service
jest.mock('../../services/todoService');

describe('fetchTodos Thunk', () => {
  it('dispatched LOADING und SUCCESS bei erfolgreichem API Call', async () => {
    // Mock Response
    const mockTodos = [
      { id: '1', text: 'Test Todo', completed: false }
    ];
    (todoService.fetchTodos as jest.Mock).mockResolvedValue(mockTodos);
    
    // Store erstellen
    const store = mockStore({ todos: { items: [], loading: false } });
    
    // Thunk dispatchen
    await store.dispatch(fetchTodos() as any);
    
    // Actions prüfen
    const actions = store.getActions();
    expect(actions[0].type).toBe('todos/fetchTodosStart');
    expect(actions[1].type).toBe('todos/fetchTodosSuccess');
    expect(actions[1].payload).toEqual(mockTodos);
  });
  
  it('dispatched FAILURE bei Fehler', async () => {
    // Mock Error
    (todoService.fetchTodos as jest.Mock).mockRejectedValue(
      new Error('Network Error')
    );
    
    const store = mockStore({ todos: { items: [], loading: false } });
    await store.dispatch(fetchTodos() as any);
    
    const actions = store.getActions();
    expect(actions[0].type).toBe('todos/fetchTodosStart');
    expect(actions[1].type).toBe('todos/fetchTodosFailure');
  });
});
```

**Problem:** Viele Mocks nötig! (Deshalb ist Saga besser testbar)

---

## 🔧 Moderne Alternative: createAsyncThunk

Redux Toolkit bietet `createAsyncThunk` für weniger Boilerplate:

```typescript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as todoService from '../../services/todoService';

// Thunk mit automatischen Actions
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async (_, { rejectWithValue }) => {
    try {
      const todos = await todoService.fetchTodos();
      return todos; // payload für fulfilled
    } catch (error: any) {
      return rejectWithValue(error.message); // payload für rejected
    }
  }
);

// Slice mit extraReducers
const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
```

**Vorteile:**
- ✅ Weniger Boilerplate
- ✅ Automatische Action Types (pending/fulfilled/rejected)
- ✅ TypeScript Support
- ✅ Besseres Error Handling

---

## 💡 Best Practices

### 1. Eine Datei pro Feature

```
features/
  todos/
    todosSlice.ts      // Reducer + Sync Actions
    todosThunks.ts     // Async Thunks
    todosSelectors.ts  // Selectors
```

### 2. Thunks für alle asynchronen Operationen

```typescript
// ✅ Gut - Business Logic im Thunk
export const createTodo = (text: string) => async (dispatch) => {
  const todo = await api.createTodo({ text });
  dispatch(addTodo(todo));
};

// ❌ Schlecht - Business Logic im Component
function AddTodo() {
  const handleSubmit = async () => {
    const todo = await api.createTodo({ text });
    dispatch(addTodo(todo));
  };
}
```

### 3. Error Handling konsistent

```typescript
export const fetchTodos = () => async (dispatch) => {
  dispatch(fetchTodosStart());
  try {
    const todos = await api.fetchTodos();
    dispatch(fetchTodosSuccess(todos));
  } catch (error: any) {
    // Konsistentes Error Format
    const message = error.response?.data?.error 
      || error.message 
      || 'Unbekannter Fehler';
    dispatch(fetchTodosFailure(message));
  }
};
```

### 4. Loading States pro Operation

```typescript
interface TodosState {
  items: Todo[];
  loading: {
    fetch: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  error: string | null;
}
```

### 5. TypeScript Types

```typescript
import { ThunkAction } from 'redux-thunk';
import { RootState } from '../../app/store';
import { AnyAction } from 'redux';

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;

// Usage
export const fetchTodos = (): AppThunk => async (dispatch) => {
  // Type-safe!
};
```

---

## 📚 Zusammenfassung

### Redux Thunk in einem Satz:
**Redux Thunk erlaubt das Dispatchen von Functions statt Objects, um asynchrone Logik außerhalb von Components zu verwalten.**

### Die 3 Kernkonzepte:

1. **Thunk = Function die Function zurückgibt**
   ```typescript
   const thunk = (params) => (dispatch, getState) => { ... };
   ```

2. **Middleware fängt Functions ab**
   - Object Action → geht zum Reducer
   - Function Action → wird ausgeführt mit dispatch & getState

3. **Async/Await für Side Effects**
   - API Calls
   - LocalStorage
   - Timeouts/Intervals

### Wann Thunk nutzen?

- ✅ Einfache bis mittlere asynchrone Logik
- ✅ Standard CRUD Operations
- ✅ Schnelle Entwicklung wichtig
- ✅ Team kennt Async/Await
- ❌ Sehr komplexe Flows (→ Saga)
- ❌ Cancellation wichtig (→ Saga)
- ❌ Perfekte Testbarkeit (→ Saga)

### Moderne Alternative:
**Redux Toolkit's `createAsyncThunk`** reduziert Boilerplate massiv!

---

## 🎯 Next Steps

1. Lies das Tutorial: `THUNK_TUTORIAL.md`
2. Implementiere Login Thunk
3. Implementiere CRUD Thunks für Todos
4. Nutze `createAsyncThunk` (Redux Toolkit)
5. Bei Bedarf: Migriere zu Saga für komplexe Flows

**Redux Thunk ist der perfekte Einstieg in asynchrones Redux! 🚀**
