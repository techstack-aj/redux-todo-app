# Redux Thunk Tutorial

## Was ist Redux Thunk?

**Thunk** = Funktion die Funktion zurückgibt (verzögerte Ausführung)

```typescript
// Normal (synchron)
const action = () => ({ type: 'ADD_TODO' });

// Thunk (asynchron)
const thunkAction = () => async (dispatch) => {
  dispatch({ type: 'LOADING' });
  const data = await api.call();
  dispatch({ type: 'SUCCESS', payload: data });
};
```

---

## Flow

```
Component → dispatch(loginThunk(credentials))
   ↓
Thunk Middleware erkennt Funktion
   ↓
Führt Funktion aus mit dispatch
   ↓
Thunk macht API Call
   ↓
Dispatcht start/success/failure Actions
   ↓
Reducer aktualisiert State
```

---

## Pattern

```typescript
export const actionThunk = (params) => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(startAction());
      const result = await apiService.call(params);
      dispatch(successAction(result));
    } catch (error: any) {
      dispatch(failureAction(error.message));
    }
  };
};
```

---

## Aufgabe: Login Thunk

**Datei:** `frontend/src/features/auth/authThunks.ts`

**Implementiere:**
```typescript
export const loginThunk = (credentials: LoginCredentials) => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(authStart({ loadingType: 'thunk' }));
      const { user, token } = await authService.login(credentials);
      dispatch(authSuccess({ user, token, middlewareType: 'thunk' }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login fehlgeschlagen';
      dispatch(authFailure(errorMessage));
    }
  };
};
```

**Testen:**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Login mit: test@test.com / test123

**Tipp:** Kopiere loginThunk und ändere nur den Service-Call!

---

### ✅ AUFGABE 3: Fetch Todos Thunk

**Datei:** `frontend/src/features/todos/todosThunks.ts`

Pattern:
```typescript
export const fetchTodosThunk = () => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(fetchTodosStart());
      const todos = await todoService.fetchTodos();
      dispatch(fetchTodosSuccess(todos));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Laden fehlgeschlagen';
      dispatch(fetchTodosFailure(errorMessage));
    }
  };
};
```

---

### ✅ AUFGABE 4-8: Weitere Todo Thunks

Implementiere nach gleichem Muster:
- `createTodoThunk(text)` → `todoService.createTodo(text)`
- `updateTodoThunk(id, updates)` → `todoService.updateTodo(id, updates)`
- `deleteTodoThunk(id)` → `todoService.deleteTodo(id)`
- `toggleTodoThunk(id)` → `todoService.toggleTodo(id)`

**Welche Action dispatchen?**
- Create → `addTodo(newTodo)`
- Update → `updateTodo(updatedTodo)`
- Delete → `removeTodo(id)`
- Toggle → `updateTodo(updatedTodo)`

---

## 🎓 VERSTÄNDNISFRAGEN

Beantworte diese Fragen für dich selbst:

1. **Warum brauchen wir Thunks?**
   → Weil Reducer synchron sein müssen, aber API Calls async sind

2. **Was macht die Thunk Middleware?**
   → Erkennt Funktionen statt Actions und führt sie aus

3. **Warum 3 Actions (start, success, failure)?**
   → Um Loading-State und Error-Handling im UI zu ermöglichen

4. **Wann wird authStart() dispatched?**
   → Vor dem API Call (Loading aktivieren)

5. **Was passiert bei einem API-Fehler?**
   → catch Block → authFailure(error) → State bekommt error

---

## ✅ CHECKLISTE

- [ ] loginThunk implementiert und getestet
- [ ] registerThunk implementiert und getestet
- [ ] fetchTodosThunk implementiert
- [ ] createTodoThunk implementiert
- [ ] updateTodoThunk implementiert
- [ ] deleteTodoThunk implementiert
- [ ] toggleTodoThunk implementiert
- [ ] Redux DevTools zeigt alle Actions korrekt
- [ ] Todos werden vom Backend geladen
- [ ] Neue Todos können erstellt werden
- [ ] Error Handling funktioniert

---

## 🐛 DEBUGGING TIPPS

**Problem: "dispatch is not a function"**
→ Vergessen `return async (dispatch) =>` zu schreiben

**Problem: "Actions werden nicht dispatched"**
→ Prüfe ob du `dispatch(action())` schreibst (mit Klammern!)

**Problem: "API Call funktioniert nicht"**
→ Backend läuft? Token vorhanden? CORS aktiviert?

**Problem: "State ändert sich nicht"**
→ Redux DevTools öffnen → Actions Tab → Welche Actions wurden dispatched?

---

## 📖 WEITERFÜHREND

Nachdem du alle Thunks implementiert hast:

1. Schaue in Redux DevTools welche Actions dispatched werden
2. Beobachte State Changes in Echtzeit
3. Teste verschiedene Error-Szenarien (Backend aus, falsche Credentials)
4. Vergleiche später mit Redux Saga & Observable!

**Nächster Schritt:** SAGA_TUTORIAL.md
