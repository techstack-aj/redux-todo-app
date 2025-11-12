# 🚀 Frontend - Todo App mit Redux

React + TypeScript + Redux Toolkit + Vite

## 📦 Installation

```bash
cd frontend
npm install
```

## 🚀 Dev Server starten

```bash
npm run dev
```

App läuft auf: `http://localhost:5173`

## 🏗️ Projektstruktur

```
frontend/
├── src/
│   ├── app/
│   │   ├── store.ts          # Redux Store Config
│   │   └── hooks.ts          # Typed Redux Hooks
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── authSlice.ts      # Auth State (Reducer + Actions)
│   │   │   └── authThunks.ts     # Async Auth Actions (Thunk)
│   │   └── todos/
│   │       ├── todosSlice.ts     # Todos State
│   │       └── todosThunks.ts    # Async Todo Actions (Thunk)
│   │
│   ├── services/
│   │   ├── api.ts            # Axios Config + Interceptors
│   │   ├── authService.ts    # Auth API Calls
│   │   └── todoService.ts    # Todo API Calls
│   │
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   └── Todos/
│   │       ├── TodoList.tsx
│   │       ├── TodoItem.tsx
│   │       ├── AddTodo.tsx
│   │       └── TodoFilters.tsx
│   │
│   ├── types/
│   │   └── index.ts          # TypeScript Types
│   │
│   ├── App.tsx               # Root Component
│   └── main.tsx              # Entry Point
│
└── package.json
```

## 🔄 Redux Flux-Architektur (Kapitel 4.1)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  1. USER INTERACTION (React Component)          │
│     └─> dispatch(action)                        │
│                                                 │
│  2. ACTION CREATOR (Thunk)                      │
│     └─> Async Logic (API Call)                 │
│     └─> dispatch(authStart/Success/Failure)    │
│                                                 │
│  3. MIDDLEWARE (Redux Thunk) ✅                 │
│     └─> Ermöglicht async Actions               │
│                                                 │
│  4. REDUCER (Slice)                             │
│     └─> State Update (immutable)               │
│                                                 │
│  5. STORE                                        │
│     └─> Neuer State gespeichert                │
│                                                 │
│  6. COMPONENTS (useSelector)                    │
│     └─> Re-Render mit neuem State              │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🎯 Redux Thunk Erklärung (Kapitel 5.2)

### Was ist Redux Thunk?

**Thunk** = Funktion die eine andere Funktion zurückgibt (delayed execution)

```typescript
// Normale Action Creator (synchron)
const normalAction = () => ({
  type: 'ACTION_TYPE',
  payload: data,
});

// Thunk Action Creator (asynchron)
const thunkAction = () => {
  return async (dispatch) => {
    dispatch({ type: 'START' });
    const data = await fetchFromAPI();
    dispatch({ type: 'SUCCESS', payload: data });
  };
};
```

### Vorteile:
✅ Einfach zu verstehen  
✅ Bereits in Redux Toolkit enthalten  
✅ Ideal für simple async Operations  
✅ Wenig Boilerplate  

### Nachteile:
❌ Schwer testbar (async Code in Action Creators)  
❌ Keine Abbruch-Logik für API Calls  
❌ Komplexe async Flows werden unübersichtlich  

## 📚 Features

### Authentifizierung
- Login / Register mit JWT
- Token in localStorage
- Auto-Logout bei ungültigem Token
- Auth State Management

### Todo Management
- Todos erstellen, bearbeiten, löschen
- Toggle completed Status
- Filter (Alle / Aktiv / Erledigt)
- Statistiken (Gesamt / Aktiv / Erledigt)

### Redux State
- Auth Slice (User, Token, Loading, Error)
- Todos Slice (Items, Filter, Loading, Error)
- TypeScript für Type Safety
- Redux DevTools Integration

## 🛠️ Technologien

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Redux Toolkit** - State Management
- **Redux Thunk** - Async Middleware (Standard in RTK)
- **Axios** - HTTP Client
- **Vite** - Build Tool

## 📖 Weitere Middleware (Tag 2)

Morgen implementieren wir:
- **Redux Saga** (Generator Functions)
- **Redux Observable** (RxJS Streams)

Dann vergleichen wir alle 3 Ansätze!
