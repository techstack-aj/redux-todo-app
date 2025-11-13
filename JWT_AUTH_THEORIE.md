# 🔐 JWT Authentifizierung - Theoretische Grundlagen

## Was ist JWT?

**JWT** (JSON Web Token) ist ein **offener Standard (RFC 7519)** für die sichere Übertragung von Informationen zwischen zwei Parteien als JSON-Objekt. JWTs werden hauptsächlich für **Authentifizierung** und **Autorisierung** in modernen Web-Anwendungen verwendet.

Ein JWT ist ein **selbstständiger Token**, der alle notwendigen Informationen über den User enthält – **ohne Datenbank-Lookup** auf dem Server.

---

## 🎯 Warum JWT?

### Das Problem mit Sessions

**Traditionelle Session-basierte Authentifizierung:**

```
1. User loggt ein → Server erstellt Session → speichert in DB
2. Server sendet Session-ID als Cookie
3. Bei jedem Request: Cookie → Server prüft DB → User-Info
4. Logout: Session aus DB löschen
```

**Probleme:**
- ❌ **Stateful** - Server muss Sessions speichern (Memory/DB)
- ❌ **Skalierung schwierig** - Load Balancer müssen Session-Affinity haben
- ❌ **Datenbank-Lookup** bei jedem Request
- ❌ **CORS-Probleme** mit Cookies
- ❌ **Mobile Apps** - Cookies funktionieren nicht gut

### Die Lösung: JWT

**Token-basierte Authentifizierung:**

```
1. User loggt ein → Server erstellt JWT → sendet Token
2. Client speichert Token (localStorage/memory)
3. Bei jedem Request: Token im Authorization Header
4. Server validiert Token (kein DB-Lookup!)
5. Logout: Token löschen (Client-seitig)
```

**Vorteile:**
- ✅ **Stateless** - Server speichert nichts
- ✅ **Skalierbar** - Jeder Server kann Token validieren
- ✅ **Kein DB-Lookup** - Token enthält alle Infos
- ✅ **CORS-freundlich** - Headers statt Cookies
- ✅ **Mobile-freundlich** - Einfach zu speichern

---

## 🏗️ JWT Struktur

Ein JWT besteht aus **drei Teilen**, getrennt durch Punkte:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

[Header].[Payload].[Signature]
```

### 1. Header (rot)

```json
{
  "alg": "HS256",      // Algorithmus (HMAC SHA256)
  "typ": "JWT"          // Token-Typ
}
```

Base64-encoded: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

**Was steht im Header?**
- Signatur-Algorithmus (HS256, RS256, etc.)
- Token-Typ (immer "JWT")

### 2. Payload (grün)

```json
{
  "sub": "1234567890",           // Subject (User ID)
  "name": "John Doe",            // User Name
  "email": "john@example.com",   // User Email
  "role": "admin",               // User Role
  "iat": 1516239022,             // Issued At (Timestamp)
  "exp": 1516242622              // Expiration (Timestamp)
}
```

Base64-encoded: `eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ`

**Was steht im Payload?**
- **Standard Claims** (vordefiniert):
  - `sub` - Subject (User ID)
  - `iat` - Issued At (Erstellungszeitpunkt)
  - `exp` - Expiration (Ablaufzeitpunkt)
  - `iss` - Issuer (Aussteller)
  - `aud` - Audience (Zielgruppe)
- **Custom Claims** (beliebig):
  - `name`, `email`, `role`, etc.

**⚠️ WICHTIG:** Payload ist **nicht verschlüsselt**, nur Base64-encoded! Keine sensiblen Daten (Passwörter) hier!

### 3. Signature (blau)

```javascript
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

Base64-encoded: `SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`

**Was ist die Signatur?**
- Hash von Header + Payload mit **Secret Key**
- Stellt sicher, dass Token **nicht manipuliert** wurde
- Nur Server mit Secret kann Signatur erstellen/prüfen

---

## 🔄 JWT Authentifizierungs-Flow

### 1. Login Flow

```
┌─────────────┐                          ┌─────────────┐
│   Client    │                          │   Server    │
└──────┬──────┘                          └──────┬──────┘
       │                                        │
       │  POST /api/auth/login                 │
       │  { email, password }                  │
       ├──────────────────────────────────────>│
       │                                        │
       │                                        │ 1. Prüfe Credentials
       │                                        │ 2. User in DB?
       │                                        │ 3. Passwort korrekt?
       │                                        │
       │                                        │ 4. Erstelle JWT:
       │                                        │    - Header
       │                                        │    - Payload (user info)
       │                                        │    - Signatur
       │                                        │
       │  200 OK                                │
       │  { token: "eyJhbGc...", user: {...} } │
       │<──────────────────────────────────────┤
       │                                        │
       │ 5. Speichere Token                    │
       │    - localStorage                      │
       │    - oder Memory                       │
       │                                        │
```

### 2. Authenticated Request Flow

```
┌─────────────┐                          ┌─────────────┐
│   Client    │                          │   Server    │
└──────┬──────┘                          └──────┬──────┘
       │                                        │
       │  GET /api/todos                       │
       │  Authorization: Bearer eyJhbGc...     │
       ├──────────────────────────────────────>│
       │                                        │
       │                                        │ 1. Extrahiere Token
       │                                        │ 2. Validiere Signatur
       │                                        │ 3. Prüfe Expiration
       │                                        │ 4. Extrahiere User-Info
       │                                        │
       │  200 OK                                │
       │  { todos: [...] }                     │
       │<──────────────────────────────────────┤
       │                                        │
```

### 3. Logout Flow

```
┌─────────────┐                          ┌─────────────┐
│   Client    │                          │   Server    │
└──────┬──────┘                          └──────┬──────┘
       │                                        │
       │  POST /api/auth/logout                │
       ├──────────────────────────────────────>│
       │                                        │
       │                                        │ Optional:
       │                                        │ - Token auf Blacklist
       │                                        │ - Revoke in DB
       │                                        │
       │  200 OK                                │
       │<──────────────────────────────────────┤
       │                                        │
       │ Lösche Token (Client-seitig)          │
       │ - localStorage.removeItem('token')    │
       │ - oder Memory löschen                  │
       │                                        │
```

---

## 💻 Implementation: Backend (Node.js/Express)

### Installation

```bash
npm install jsonwebtoken bcryptjs
npm install --save-dev @types/jsonwebtoken @types/bcryptjs
```

### 1. User Model

```typescript
// models/User.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

// Hash Passwort vor dem Speichern
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Methode zum Passwort-Vergleich
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
```

### 2. JWT Utilities

```typescript
// utils/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d'; // 7 Tage

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Token erstellen
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Token validieren
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Token dekodieren (ohne Validierung)
export const decodeToken = (token: string) => {
  return jwt.decode(token);
};
```

### 3. Auth Controller

```typescript
// controllers/authController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';

// Register
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    // Prüfe ob User existiert
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Erstelle User (Passwort wird automatisch gehashed)
    const user = await User.create({ email, password, name });
    
    // Erstelle JWT
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Finde User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Prüfe Passwort
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Erstelle JWT
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get Current User (mit Token)
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // req.user wurde von auth Middleware gesetzt
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
```

### 4. Auth Middleware

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Erweitere Express Request Type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Token aus Header extrahieren
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Format: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    // 2. Token validieren
    const decoded = verifyToken(token);
    
    // 3. User-Info an Request anhängen
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Optional: Role-basierte Middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};
```

### 5. Routes

```typescript
// routes/auth.ts
import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public Routes
router.post('/register', register);
router.post('/login', login);

// Protected Routes
router.get('/me', authMiddleware, getCurrentUser);

export default router;
```

```typescript
// routes/todos.ts
import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { getTodos, createTodo, deleteTodo } from '../controllers/todoController';

const router = express.Router();

// Alle Routes benötigen Authentifizierung
router.use(authMiddleware);

router.get('/', getTodos);
router.post('/', createTodo);

// Nur Admins können löschen
router.delete('/:id', requireRole(['admin']), deleteTodo);

export default router;
```

### 6. Server Setup

```typescript
// server.ts
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import todoRoutes from './routes/todos';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 💻 Implementation: Frontend (React/Redux)

### 1. API Service

```typescript
// services/api.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Axios Instance mit Interceptor
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Token automatisch hinzufügen
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - 401 Error Handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token abgelaufen oder ungültig
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Auth Service

```typescript
// services/authService.ts
import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  
  // Token speichern
  localStorage.setItem('token', response.data.token);
  
  return response.data;
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', credentials);
  
  // Token speichern
  localStorage.setItem('token', response.data.token);
  
  return response.data;
};

export const logout = () => {
  // Token löschen
  localStorage.removeItem('token');
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data.user;
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};
```

### 3. Auth Slice (Redux)

```typescript
// features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
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
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
```

### 4. Auth Thunks

```typescript
// features/auth/authThunks.ts
import { AppDispatch } from '../../app/store';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction } from './authSlice';
import * as authService from '../../services/authService';

export const loginThunk = (credentials: { email: string; password: string }) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(loginStart());
      
      const response = await authService.login(credentials);
      
      dispatch(loginSuccess({
        user: response.user,
        token: response.token,
      }));
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      dispatch(loginFailure(message));
    }
  };
};

export const registerThunk = (credentials: { email: string; password: string; name: string }) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(loginStart());
      
      const response = await authService.register(credentials);
      
      dispatch(loginSuccess({
        user: response.user,
        token: response.token,
      }));
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      dispatch(loginFailure(message));
    }
  };
};

export const logoutThunk = () => {
  return (dispatch: AppDispatch) => {
    authService.logout();
    dispatch(logoutAction());
  };
};

export const loadUserThunk = () => {
  return async (dispatch: AppDispatch) => {
    try {
      const token = authService.getToken();
      
      if (!token) return;
      
      const user = await authService.getCurrentUser();
      
      dispatch(loginSuccess({ user, token }));
    } catch (error) {
      // Token ungültig → Logout
      dispatch(logoutAction());
    }
  };
};
```

### 5. Login Component

```typescript
// components/Auth/LoginForm.tsx
import { useState, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk } from '../../features/auth/authThunks';
import { RootState } from '../../app/store';

function LoginForm() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(loginThunk({ email, password }));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}

export default LoginForm;
```

### 6. Protected Route

```typescript
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  // Nicht eingeloggt → Login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  // Role-Check (optional)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
}

export default ProtectedRoute;
```

### 7. App Setup

```typescript
// App.tsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadUserThunk } from './features/auth/authThunks';
import LoginForm from './components/Auth/LoginForm';
import TodoList from './components/Todos/TodoList';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const dispatch = useDispatch();
  
  // User beim App-Start laden (wenn Token vorhanden)
  useEffect(() => {
    dispatch(loadUserThunk());
  }, [dispatch]);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        
        <Route
          path="/todos"
          element={
            <ProtectedRoute>
              <TodoList />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 🔒 Security Best Practices

### 1. Secret Key sicher aufbewahren

```typescript
// ❌ FALSCH - Secret im Code
const JWT_SECRET = 'my-secret-key';

// ✅ RICHTIG - Secret in Environment Variable
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined');
}
```

**`.env` Datei:**
```
JWT_SECRET=your-very-long-random-secret-key-here
```

### 2. Token Expiration setzen

```typescript
// Token läuft nach 7 Tagen ab
const token = jwt.sign(payload, JWT_SECRET, {
  expiresIn: '7d',
});
```

**Typische Expiration Times:**
- Access Token: **15 Minuten - 1 Stunde**
- Refresh Token: **7 Tage - 30 Tage**

### 3. HTTPS verwenden

```typescript
// ❌ NIEMALS über HTTP (unverschlüsselt)!
// http://example.com/api

// ✅ Immer HTTPS (verschlüsselt)
// https://example.com/api
```

### 4. Sensible Daten nicht im Payload

```typescript
// ❌ FALSCH - Passwort im Token
const token = jwt.sign({
  userId: user.id,
  password: user.password, // ❌ Niemals!
}, JWT_SECRET);

// ✅ RICHTIG - Nur nicht-sensible Daten
const token = jwt.sign({
  userId: user.id,
  email: user.email,
  role: user.role,
}, JWT_SECRET);
```

### 5. Token-Speicherung

**Optionen:**

| Ort | Sicherheit | XSS | CSRF | Empfehlung |
|-----|-----------|-----|------|------------|
| **localStorage** | ⚠️ Mittel | ❌ Anfällig | ✅ Sicher | Einfache Apps |
| **sessionStorage** | ⚠️ Mittel | ❌ Anfällig | ✅ Sicher | Session-basiert |
| **Memory (State)** | ✅ Sicher | ✅ Sicher | ✅ Sicher | **Beste Option** |
| **Cookie (httpOnly)** | ✅ Sicher | ✅ Sicher | ❌ Anfällig | Mit CSRF-Token |

**Empfehlung: Memory + Refresh Token in httpOnly Cookie**

### 6. Refresh Token Pattern

```typescript
// Zwei Tokens:
// 1. Access Token (kurze Laufzeit, in Memory)
// 2. Refresh Token (lange Laufzeit, httpOnly Cookie)

// Login
export const login = async (req: Request, res: Response) => {
  // ... Auth Logic
  
  // Access Token (15 Min)
  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: '15m',
  });
  
  // Refresh Token (7 Tage)
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: '7d',
  });
  
  // Refresh Token als httpOnly Cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true, // Nur HTTPS
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Tage
  });
  
  // Access Token im Response Body
  res.json({ accessToken, user });
};

// Refresh Endpoint
export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    
    // Neuer Access Token
    const accessToken = jwt.sign({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }, ACCESS_SECRET, {
      expiresIn: '15m',
    });
    
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};
```

### 7. Token Revocation (Blacklist)

```typescript
// Token auf Blacklist setzen (z.B. bei Logout)
const blacklist = new Set<string>(); // In Production: Redis

export const logout = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    blacklist.add(token);
    // In Production: Redis mit Expiration
    // await redis.setex(`blacklist:${token}`, 3600, '1');
  }
  
  res.json({ message: 'Logged out' });
};

// Middleware: Prüfe Blacklist
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (blacklist.has(token)) {
    return res.status(401).json({ error: 'Token revoked' });
  }
  
  // ... normale Token-Validierung
};
```

---

## 🆚 JWT vs Session

| Feature | JWT | Session |
|---------|-----|---------|
| **Storage** | Client (Token) | Server (DB/Memory) |
| **Stateless** | ✅ Ja | ❌ Nein |
| **Scalability** | ✅ Sehr gut | ⚠️ Schwieriger |
| **Revocation** | ❌ Schwierig | ✅ Einfach |
| **Size** | ⚠️ Größer | ✅ Klein (Cookie) |
| **Security** | ⚠️ XSS-anfällig | ⚠️ CSRF-anfällig |
| **DB Lookup** | ✅ Nicht nötig | ❌ Bei jedem Request |
| **Mobile** | ✅ Perfekt | ⚠️ Kompliziert |

---

## 🎓 Wann JWT nutzen?

### ✅ Perfekt für JWT:

1. **Microservices**
   - Stateless → jeder Service kann Token validieren
   - Keine zentrale Session-DB nötig

2. **Mobile Apps**
   - Einfache Token-Speicherung
   - Keine Cookie-Probleme

3. **API-First Apps**
   - RESTful APIs
   - GraphQL APIs

4. **Single Page Applications (SPA)**
   - React, Vue, Angular
   - CORS-freundlich

5. **Hohe Skalierung**
   - Keine Session-Affinity
   - Load Balancer einfach

### ❌ Session besser:

1. **Echtzeit-Revocation wichtig**
   - Instant Logout aller Devices
   - Admin kann User sperren

2. **Sehr sensible Daten**
   - Banking
   - Healthcare

3. **Server-rendered Apps**
   - Traditional Multi-Page Apps
   - Cookies nativer

---

## 📚 Zusammenfassung

### JWT in einem Satz:
**JWT ist ein selbstständiger, signierter Token, der User-Informationen enthält und stateless Authentifizierung ohne Datenbank-Lookup ermöglicht.**

### Die 3 Teile eines JWT:

1. **Header** - Algorithmus & Token-Typ
2. **Payload** - User-Informationen (nicht verschlüsselt!)
3. **Signature** - Hash mit Secret Key (Manipulationssicher)

### Der Flow:

1. **Login** → Server erstellt JWT → Client speichert Token
2. **Request** → Token im Authorization Header → Server validiert
3. **Logout** → Token löschen (Client-seitig)

### Security Essentials:

- ✅ Secret Key in Environment Variables
- ✅ Token Expiration setzen
- ✅ HTTPS verwenden
- ✅ Keine sensiblen Daten im Payload
- ✅ Token in Memory speichern (nicht localStorage)
- ✅ Refresh Token Pattern nutzen
- ✅ Blacklist für Revocation

### Wann JWT?

- ✅ Microservices, Mobile Apps, SPAs
- ✅ Stateless & Skalierbarkeit wichtig
- ❌ Instant Revocation kritisch (→ Session)

---

## 🎯 Next Steps

1. Implementiere JWT in deinem Backend
2. Füge Auth Middleware hinzu
3. Implementiere Refresh Token Pattern
4. Teste Token-Expiration
5. Implementiere Protected Routes im Frontend
6. Lerne über OAuth 2.0 & OpenID Connect (nächster Level)

**JWT ist der Standard für moderne Web-APIs! 🔐🚀**

---

## 🔗 Ressourcen

- **JWT.io** - Debugger & Dokumentation: https://jwt.io/
- **RFC 7519** - JWT Spec: https://tools.ietf.org/html/rfc7519
- **jsonwebtoken** - Node.js Library: https://github.com/auth0/node-jsonwebtoken
- **OWASP JWT Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
