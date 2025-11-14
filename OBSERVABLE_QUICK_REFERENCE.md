# 🎯 State-Management mit RxJS - Quick Reference

**Kapitel:** State-Management mit RxJS - Redux Observable

## 📋 Übersicht: Was ist zu tun?

### **Phase 1: Setup (10 Min)**
1. ✅ Epic Middleware zum Store hinzufügen (`store.ts`)
2. ✅ Root-Epic erstellen und kombinieren
3. ✅ Ersten Test-Epic schreiben (z.B. `fetchTodosEpic`)
4. ✅ In Komponente testen

### **Phase 2: Basis-Epics (30 Min)**
5. ⬜ Fetch Todos Epic
6. ⬜ Add Todo Epic (mit Debouncing)
7. ⬜ Delete Todo Epic (mit Retry)
8. ⬜ Toggle Todo Epic (optimistisch)

### **Phase 3: Auth-Epics (20 Min)**
9. ⬜ Login Epic
10. ⬜ Register Epic
11. ⬜ Logout Epic mit Cleanup

### **Phase 4: Advanced (20 Min)**
12. ⬜ Search Epic (Debouncing + Cancel)
13. ⬜ Auto-Logout Epic (Interval)
14. ⬜ Token Refresh Epic (Bonus)

---

## 🔧 RxJS Operators Cheat Sheet

### **Transformation**

```typescript
// map - Wert transformieren
action$.pipe(
  map(action => action.payload)
)

// switchMap - Inner Observable, automatisches Cancel
action$.pipe(
  switchMap(action => 
    todoService.getTodos() // Alter Request wird gecancelt
  )
)

// mergeMap - Parallele Inner Observables
action$.pipe(
  mergeMap(action => 
    todoService.addTodo() // Requests laufen parallel
  )
)

// concatMap - Sequenzielle Inner Observables
action$.pipe(
  concatMap(action => 
    todoService.updateTodo() // Requests nacheinander
  )
)
```

### **Filtering**

```typescript
// filter - Nur bestimmte Werte durchlassen
action$.pipe(
  filter(action => action.type === 'todos/fetchTodos')
)

// debounceTime - Wartet nach letztem Event
action$.pipe(
  debounceTime(500) // 500ms nach letzter Eingabe
)

// throttleTime - Max. 1 Wert pro Zeitspanne
action$.pipe(
  throttleTime(1000) // Max. 1x pro Sekunde
)

// distinctUntilChanged - Nur bei Änderung
action$.pipe(
  distinctUntilChanged() // Filtert Duplikate
)
```

### **Error Handling**

```typescript
// catchError - Fehler abfangen
action$.pipe(
  switchMap(action => todoService.getTodos()),
  catchError(error => 
    of(fetchTodosFailure(error.message))
  )
)

// retry - Automatisch wiederholen
action$.pipe(
  switchMap(action => todoService.deleteTodo()),
  retry(3) // 3 Versuche
)

// retryWhen - Wiederholen mit Logik
action$.pipe(
  switchMap(action => todoService.getTodos()),
  retryWhen(errors => 
    errors.pipe(
      delay(1000), // 1s Delay zwischen Versuchen
      take(3)      // Max. 3 Versuche
    )
  )
)
```

### **Kombination**

```typescript
// merge - Mehrere Streams parallel
merge(
  fetchTodosEpic(action$),
  addTodoEpic(action$)
)

// concat - Mehrere Streams nacheinander
concat(
  of(toggleTodoLocal(id)),
  todoService.toggleTodo(id)
)

// combineLatest - Kombiniert letzte Werte
combineLatest([action$, state$]).pipe(
  map(([action, state]) => ...)
)
```

### **Utility**

```typescript
// tap - Side-Effects (z.B. Logging)
action$.pipe(
  tap(action => console.log('Action:', action)),
  switchMap(...)
)

// delay - Verzögerung einfügen
action$.pipe(
  delay(1000) // 1s Verzögerung
)

// takeUntil - Bis anderer Stream emittiert
action$.pipe(
  takeUntil(logoutAction$) // Stoppt bei Logout
)

// take - Nur erste N Werte
action$.pipe(
  take(3) // Nur erste 3 Werte
)
```

---

## 🎨 Epic-Patterns

### **Pattern 1: Einfacher API-Call**
```typescript
export const fetchTodosEpic: Epic = (action$) => {
  return action$.pipe(
    filter(action => action.type === 'todos/fetchTodosRequest'),
    switchMap(action => 
      todoService.getTodos().pipe(
        map(todos => fetchTodosSuccess(todos)),
        catchError(error => of(fetchTodosFailure(error.message)))
      )
    )
  );
};
```

### **Pattern 2: Debounced Search**
```typescript
export const searchTodosEpic: Epic = (action$) => {
  return action$.pipe(
    filter(action => action.type === 'todos/searchTodos'),
    map(action => action.payload),
    debounceTime(500),
    distinctUntilChanged(),
    switchMap(query =>
      todoService.searchTodos(query).pipe(
        map(results => searchTodosSuccess(results)),
        catchError(error => of(searchTodosFailure(error.message)))
      )
    )
  );
};
```

### **Pattern 3: Optimistisches Update**
```typescript
export const toggleTodoEpic: Epic = (action$, state$) => {
  return action$.pipe(
    filter(action => action.type === 'todos/toggleTodoRequest'),
    mergeMap(action => {
      const todoId = action.payload;
      return concat(
        // 1. Sofort UI updaten
        of(toggleTodoLocal(todoId)),
        // 2. API-Call im Hintergrund
        todoService.toggleTodo(todoId).pipe(
          map(() => toggleTodoSuccess(todoId)),
          // 3. Bei Fehler: Rollback
          catchError(error => of(toggleTodoRollback(todoId)))
        )
      );
    })
  );
};
```

### **Pattern 4: Retry mit Backoff**
```typescript
export const deleteTodoEpic: Epic = (action$) => {
  return action$.pipe(
    filter(action => action.type === 'todos/deleteTodoRequest'),
    switchMap(action =>
      todoService.deleteTodo(action.payload).pipe(
        retryWhen(errors =>
          errors.pipe(
            mergeMap((error, index) => {
              if (index >= 3) throw error; // Nach 3 Versuchen abbrechen
              return of(error).pipe(delay(Math.pow(2, index) * 1000)); // 1s, 2s, 4s
            })
          )
        ),
        map(() => deleteTodoSuccess(action.payload)),
        catchError(error => of(deleteTodoFailure(error.message)))
      )
    )
  );
};
```

### **Pattern 5: Interval-basierte Checks**
```typescript
export const autoLogoutEpic: Epic = (action$, state$) => {
  return interval(60000).pipe( // Alle 60s
    filter(() => state$.value.auth.isAuthenticated),
    map(() => {
      const token = state$.value.auth.token;
      const isExpired = checkTokenExpiration(token);
      return isExpired;
    }),
    filter(isExpired => isExpired === true),
    map(() => logout()),
    takeUntil(action$.pipe(filter(a => a.type === 'auth/logout')))
  );
};
```

---

## ⚠️ Häufige Fehler

### **Fehler 1: catchError ohne Observable zurückgeben**
```typescript
// ❌ FALSCH
catchError(error => fetchTodosFailure(error.message))

// ✅ RICHTIG
catchError(error => of(fetchTodosFailure(error.message)))
```

### **Fehler 2: filter statt ofType**
```typescript
// ❌ Umständlich
filter(action => action.type === 'todos/fetchTodos')

// ✅ Besser (falls verfügbar)
ofType('todos/fetchTodos')
```

### **Fehler 3: Nested Subscribes**
```typescript
// ❌ FALSCH
action$.subscribe(action => {
  todoService.getTodos().subscribe(todos => {
    dispatch(fetchTodosSuccess(todos));
  });
});

// ✅ RICHTIG
action$.pipe(
  switchMap(action => todoService.getTodos()),
  map(todos => fetchTodosSuccess(todos))
)
```

### **Fehler 4: switchMap für parallele Requests**
```typescript
// ❌ FALSCH für parallele Add-Requests
switchMap(action => todoService.addTodo())

// ✅ RICHTIG
mergeMap(action => todoService.addTodo())
```

---

## 🧪 Testing-Tipps

```typescript
import { TestScheduler } from 'rxjs/testing';

it('should fetch todos', () => {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });

  testScheduler.run(({ hot, cold, expectObservable }) => {
    const action$ = hot('-a', {
      a: { type: 'todos/fetchTodosRequest' }
    });
    
    const output$ = fetchTodosEpic(action$);
    
    expectObservable(output$).toBe('-b', {
      b: { type: 'todos/fetchTodosSuccess', payload: [...] }
    });
  });
});
```

---

## 📚 Weiterführende Ressourcen

- **RxJS Docs:** https://rxjs.dev/
- **Redux-Observable Docs:** https://redux-observable.js.org/
- **RxJS Marbles:** https://rxmarbles.com/
- **Learn RxJS:** https://www.learnrxjs.io/

---

Viel Erfolg! 🚀
