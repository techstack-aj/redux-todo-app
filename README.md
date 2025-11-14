# Redux Todo App - Vollständiges Lernprojekt

React + Redux Todo-App mit **3 Middleware-Implementierungen**: Thunk, Saga & Observable

---

## 📦 Projekt-Struktur

```
ToDoApp/
├── backend/          # Express + TypeScript API
│   ├── src/
│   │   ├── server.ts
│   │   ├── controllers/  (authController, todoController)
│   │   ├── middleware/   (auth.ts - JWT Validierung)
│   │   ├── models/       (User, Todo)
│   │   └── routes/       (auth, todos)
│   └── package.json
│
├── frontend/         # React + Redux + Vite
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/   (Auth, Todos, Header)
│   │   ├── features/     (auth, todos - Slices + Middlewares)
│   │   ├── services/     (API Client, Auth/Todo Service)
│   │   └── app/          (store.ts - Redux Store)
│   └── package.json
│
└── Dokumentation/
    ├── JWT_AUTH_THEORIE.md
    ├── REDUX_MIDDLEWARE_THEORIE.md
    ├── THUNK_TUTORIAL.md
    ├── SAGA_TUTORIAL.md
    └── OBSERVABLE_TUTORIAL.md
```

---

## 🎯 Features

### Backend
- **JWT Authentifizierung** (Login, Register, Token-Validierung)
- **CRUD Todos** (geschützt mit Auth Middleware)
- **bcrypt** Password Hashing
- **TypeScript** + Express

### Frontend
- **3 Redux Middlewares parallel**:
  - 🔵 **Thunk** (async/await)
  - 🟢 **Saga** (Generator Functions)
  - 🟣 **Observable** (RxJS Streams)
- **Middleware-Switcher** (Login-Methode wählen)
- **JWT Token Management**
- **Redux DevTools Integration**

---

## 🚀 Installation & Start

### Backend
```bash
cd backend
npm install
npm run dev    # Port 3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # Port 5173
```

**Test-User:**
```
Email: test@test.com
Passwort: test123
```

---

## 🔄 Middleware Flow

```
┌─────────────┐
│  Component  │
└──────┬──────┘
       │ dispatch(action)
       ▼
┌─────────────────────────────────────┐
│         Redux Middleware            │
│  ┌────────┐  ┌────────┐  ┌────────┐│
│  │ Thunk  │  │  Saga  │  │ Epic   ││
│  │  🔵    │  │  🟢    │  │  🟣    ││
│  └───┬────┘  └───┬────┘  └───┬────┘│
└──────┼───────────┼───────────┼──────┘
       │           │           │
       │ (nur eine wird aktiv basierend auf middlewareType)
       ▼
  API Service
       │
       ▼
  Backend API
       │
       ▼
    Database
```

**Middleware-Filterung:**
```typescript
// Slice
dispatch(authStart({ loadingType: 'thunk' }));

// Saga prüft
if (middlewareType !== 'saga') return;

// Epic prüft
filter(() => state$.value.auth.middlewareType === 'observable')
```

---

## 📁 Wichtige Dateien

### Redux Store (`frontend/src/app/store.ts`)
```typescript
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { createEpicMiddleware } from 'redux-observable';

const sagaMiddleware = createSagaMiddleware();
const epicMiddleware = createEpicMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    todos: todosReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(sagaMiddleware)
      .concat(epicMiddleware),
});

sagaMiddleware.run(rootSaga);
epicMiddleware.run(rootEpic);
```

### Auth Middleware (`backend/src/middleware/auth.ts`)
```typescript
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  const decoded = jwt.verify(token, JWT_SECRET);
  req.userId = decoded.userId;
  next();
};
```

---

## 🎓 Lern-Reihenfolge

1. **JWT_AUTH_THEORIE.md** - Verstehe JWT & Session
2. **REDUX_MIDDLEWARE_THEORIE.md** - Middleware Konzept
3. **THUNK_TUTORIAL.md** - Einfachste Middleware (Start hier!)
4. **SAGA_TUTORIAL.md** - Generator-basiert
5. **OBSERVABLE_TUTORIAL.md** - RxJS Streams

---

## 🧪 Test-Szenarien

### 1. Login mit verschiedenen Middlewares
```typescript
// Wähle Middleware im Login-Form
🔵 Thunk   → async/await Pattern
🟢 Saga    → Generator Pattern  
🟣 Observable → RxJS Pattern

// Console zeigt welche aktiv ist:
console.log('🔵 THUNK: Login gestartet');
console.log('🟢 SAGA: Login gestartet');
console.log('🟣 OBSERVABLE: Login gestartet');
```

### 2. Todo CRUD
- **Add Todo** (Debounce 500ms bei Observable)
- **Toggle Todo** (mergeMap für parallele Requests)
- **Delete Todo** (Retry 3x bei Fehler)
- **Update Todo Text**

### 3. Redux DevTools
```bash
# Zeigt alle Actions:
auth/authStart
auth/authSuccess
todos/fetchTodosStart
todos/addTodo
```

---

## 🐛 Debugging

**Problem: Doppelte API Requests**
→ Middleware-Filter fehlt (`middlewareType` Check)

**Problem: Input bleibt disabled**
→ `state.loading = false` in Success-Actions vergessen

**Problem: Observable triggert nicht**
→ Prüfe Filter in Epic: `state$.value.auth.middlewareType === 'observable'`

**Problem: Token abgelaufen**
→ Backend wirft 401 → Frontend leitet zu /login

---

## 📚 Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "redux": "^5.0.0",
  "@reduxjs/toolkit": "^2.0.1",
  "redux-thunk": "^3.1.0",
  "redux-saga": "^1.3.0",
  "redux-observable": "^3.0.0-rc.2",
  "rxjs": "^7.8.1",
  "axios": "^1.6.2"
}
```

---

## 🎯 Lernziele

✅ JWT Authentifizierung verstehen  
✅ Redux Middleware Konzept  
✅ Thunk für einfache Async-Logik  
✅ Saga für komplexe Flows & Testbarkeit  
✅ Observable für reaktive Streams  
✅ TypeScript in Full-Stack App  

**Viel Erfolg! 🚀**
