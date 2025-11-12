# 🔧 Backend - Todo App mit JWT

Express.js Backend mit TypeScript und JWT-Authentifizierung.

## 📦 Installation

```bash
cd backend
npm install
```

## 🚀 Server starten

```bash
# Development Mode (mit Auto-Reload)
npm run dev

# Production Build
npm run build
npm start
```

Server läuft auf: `http://localhost:5000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Beschreibung | Auth |
|--------|----------|--------------|------|
| POST | `/api/auth/register` | Neuen User registrieren | ❌ |
| POST | `/api/auth/login` | User einloggen | ❌ |
| GET | `/api/auth/me` | Aktuellen User holen | ✅ |

### Todos

| Method | Endpoint | Beschreibung | Auth |
|--------|----------|--------------|------|
| GET | `/api/todos` | Alle Todos holen | ✅ |
| POST | `/api/todos` | Neues Todo erstellen | ✅ |
| PUT | `/api/todos/:id` | Todo aktualisieren | ✅ |
| DELETE | `/api/todos/:id` | Todo löschen | ✅ |
| PATCH | `/api/todos/:id/toggle` | Todo Status togglen | ✅ |

## 🔐 JWT Token

- Token wird bei Login/Register zurückgegeben
- Gültig für 7 Tage
- Im Frontend als `Authorization: Bearer <token>` senden

## 📝 Request Beispiele

### Register
```json
POST /api/auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "passwort123"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "passwort123"
}
```

### Todo erstellen
```json
POST /api/todos
Headers: { "Authorization": "Bearer <token>" }
{
  "text": "Redux lernen"
}
```

## 🗂️ Projektstruktur

```
backend/
├── src/
│   ├── controllers/      # Business Logic
│   ├── middleware/       # Auth Middleware
│   ├── models/          # Data Models (In-Memory)
│   ├── routes/          # API Routes
│   ├── types/           # TypeScript Types
│   └── server.ts        # Server Entry Point
├── .env                 # Umgebungsvariablen
├── package.json
└── tsconfig.json
```

## ⚙️ Umgebungsvariablen

Siehe `.env` Datei:
- `PORT`: Server Port (default: 5000)
- `JWT_SECRET`: Secret für JWT Token
- `NODE_ENV`: Umgebung (development/production)
