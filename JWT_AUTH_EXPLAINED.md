# JWT Authentifizierung - Funktionsweise

## Was ist JWT?

**JWT = JSON Web Token** - verschlüsselter String mit User-Daten

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
    ^Header              ^Payload (User-Daten)                    ^Signatur
```

---

## Flow im Projekt

### 1. Login

```
Frontend: POST /api/auth/login { email, password }
  ↓
Backend: 
  - Prüft Passwort
  - Erstellt JWT: jwt.sign({ userId, email }, SECRET_KEY)
  - Schickt zurück: { user, token }
  ↓
Frontend: 
  - localStorage.setItem('token', token)
  - Speichert in Redux State
```

**Code Backend:**
```typescript
const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
```

**Code Frontend:**
```typescript
localStorage.setItem('token', token);
apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

---

### 2. Geschützte Requests

```
Frontend: GET /api/todos
  - Header: { Authorization: 'Bearer eyJhbGc...' }
  ↓
Backend Middleware (auth.ts):
  - Liest Token aus Header
  - jwt.verify(token, SECRET_KEY) → userId
  - Fügt User-Info zu req.userId hinzu
  ↓
Route Handler:
  - Hat Zugriff auf req.userId
  - Gibt nur Todos von diesem User zurück
```

**Code Backend:**
```typescript
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, JWT_SECRET);
req.userId = decoded.userId;
```

---

### 3. Logout

```
Frontend:
  - localStorage.removeItem('token')
  - Redux State clearen
  
(Backend macht nichts - JWT ist stateless!)
```

---

## Vorteile JWT

- ✅ Backend muss keine Sessions speichern
- ✅ Token enthält alle nötigen Infos
- ✅ Kann ablaufen (exp claim)
