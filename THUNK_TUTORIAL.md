# 🎯 REDUX THUNK TUTORIAL

## Lernziel
Redux Thunk für asynchrone API-Calls implementieren und verstehen.

---

## 📚 Was ist Redux Thunk?

**Thunk** = Funktion die eine Funktion zurückgibt (verzögerte Ausführung)

### Normaler Action Creator (synchron):
```typescript
const normalAction = () => ({
  type: 'ADD_TODO',
  payload: { id: 1, text: 'Learn Redux' }
});
```

### Thunk Action Creator (asynchron):
```typescript
const thunkAction = () => {
  return async (dispatch) => {
    dispatch({ type: 'LOADING_START' });
    const data = await fetchFromAPI();
    dispatch({ type: 'SUCCESS', payload: data });
  };
};
```

---

## 🔄 Wie funktioniert Redux Thunk?

```
1. Component ruft dispatch(loginThunk(credentials))
   ↓
2. Redux Thunk Middleware erkennt: "Das ist eine Funktion!"
   ↓
3. Middleware führt die Funktion aus und übergibt dispatch
   ↓
4. Thunk führt async Code aus (API Call)
   ↓
5. Thunk dispatcht mehrere Actions (start, success, failure)
   ↓
6. Reducers aktualisieren den State
   ↓
7. Components re-rendern mit neuem State
```

---

## 📝 AUFGABEN

### ✅ AUFGABE 1: Login Thunk implementieren

**Datei:** `frontend/src/features/auth/authThunks.ts`

**Schritte:**
1. Öffne die Datei `authThunks.ts`
2. Finde die Funktion `loginThunk`
3. Implementiere nach diesem Muster:

```typescript
export const loginThunk = (credentials: LoginCredentials) => {
  // Gib eine async Funktion zurück
  return async (dispatch: Dispatch) => {
    try {
      // 1. Loading aktivieren
      dispatch(authStart());

      // 2. API Call (asynchron)
      const response = await authService.login(credentials);

      // 3. Success Action dispatchen
      dispatch(authSuccess({
        user: response.user,
        token: response.token,
      }));

      // 4. Optional: Logging
      console.log('✅ Login erfolgreich');
    } catch (error: any) {
      // 5. Error extrahieren
      const errorMessage = error.response?.data?.error 
                        || error.message 
                        || 'Login fehlgeschlagen';
      
      // 6. Failure Action dispatchen
      dispatch(authFailure(errorMessage));
      
      console.error('❌ Login Fehler:', errorMessage);
    }
  };
};
```

**Testen:**
1. Backend starten: `cd backend && npm run dev`
2. Frontend starten: `cd frontend && npm run dev`
3. Öffne `http://localhost:5173`
4. Registriere einen User
5. Logge ein
6. Schau in Redux DevTools (Actions: authStart, authSuccess)

---

### ✅ AUFGABE 2: Register Thunk

**Fast identisch zu loginThunk!**

Unterschiede:
- Nutzt `authService.register(credentials)` statt `login`
- Credentials haben zusätzlich `username` Feld

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
