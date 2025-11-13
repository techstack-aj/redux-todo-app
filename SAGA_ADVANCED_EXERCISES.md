# Redux Saga - Advanced Exercises (Nice-to-Have)

Diese Übungen sind **optional** und bauen auf den Grundlagen (Exercise 1-5) auf.

---

## **Exercise 6: Debounce Pattern**

**Ziel:** Suche verzögern, damit nicht bei jedem Tastendruck eine API-Anfrage gesendet wird.

**Konzept:**
```typescript
import { debounce } from 'redux-saga/effects';

function* searchTodosSaga(action) {
    // API Call erst nach 300ms ohne weitere Eingabe
    const results = yield call(todoService.search, action.payload.query);
    yield put(searchSuccess(results));
}

function* watchSearchTodos() {
    // Wartet 300ms, verwirft frühere Aufrufe
    yield debounce(300, 'todos/searchRequest', searchTodosSaga);
}
```

**Use Case:** Suchfeld, Auto-Complete, Filter

---

## **Exercise 7: Race & Timeout Pattern**

**Ziel:** API Call mit Timeout kombinieren - nach 5 Sekunden abbrechen.

**Konzept:**
```typescript
import { race, call, delay } from 'redux-saga/effects';

function* fetchWithTimeoutSaga() {
    const { response, timeout } = yield race({
        response: call(todoService.fetchTodos),
        timeout: delay(5000) // 5 Sekunden
    });

    if (timeout) {
        yield put(fetchTodosFailure('Timeout: Server antwortet nicht'));
    } else {
        yield put(fetchTodosSuccess(response));
    }
}
```

**Use Case:** Langsame APIs, mobile Verbindungen

---

## **Exercise 8: Retry Pattern**

**Ziel:** Bei Fehler automatisch 3x wiederholen, bevor Fehler geworfen wird.

**Konzept:**
```typescript
import { retry, call } from 'redux-saga/effects';

function* fetchTodosWithRetrySaga() {
    try {
        // Max 3 Versuche, 2 Sekunden Pause zwischen Versuchen
        const todos = yield retry(3, 2000, todoService.fetchTodos);
        yield put(fetchTodosSuccess(todos));
    } catch (error) {
        // Nach 3 Versuchen immer noch Fehler
        yield put(fetchTodosFailure('Fehler nach 3 Versuchen'));
    }
}
```

**Use Case:** Instabile Netzwerkverbindungen, temporäre Server-Fehler

---

## **Exercise 9: Cancellation Pattern**

**Ziel:** Laufende Requests abbrechen, wenn neue kommen (z.B. bei schnellem Tippen).

**Konzept:**
```typescript
import { take, fork, cancel } from 'redux-saga/effects';

function* watchSearchWithCancel() {
    let task;
    
    while (true) {
        const action = yield take('todos/searchRequest');
        
        // Vorherigen Task abbrechen
        if (task) {
            yield cancel(task);
        }
        
        // Neuen Task starten
        task = yield fork(searchTodosSaga, action);
    }
}
```

**Use Case:** Search-as-you-type, Polling abbrechen

**Hinweis:** `takeLatest` macht das automatisch! Explizite Cancellation nur für komplexe Fälle.

---

## **Exercise 10: Polling Pattern**

**Ziel:** Todos alle 10 Sekunden automatisch neu laden (z.B. für Live-Updates).

**Konzept:**
```typescript
import { delay, cancelled } from 'redux-saga/effects';

function* pollTodosSaga() {
    try {
        while (true) {
            yield call(fetchTodosSaga); // Todos laden
            yield delay(10000); // 10 Sekunden warten
        }
    } finally {
        if (yield cancelled()) {
            console.log('Polling wurde gestoppt');
        }
    }
}

function* watchPollTodos() {
    while (true) {
        yield take('todos/startPolling');
        const task = yield fork(pollTodosSaga);
        
        yield take('todos/stopPolling');
        yield cancel(task); // Polling stoppen
    }
}
```

**Use Case:** Dashboard mit Live-Daten, Chat-Nachrichten

---

## **Exercise 11: Select Effect (bereits in Exercise 5 genutzt)**

**Ziel:** Redux State innerhalb einer Saga lesen.

**Konzept:**
```typescript
import { select } from 'redux-saga/effects';

function* someComplexSaga() {
    // Ganzen State lesen
    const state = yield select();
    
    // Bestimmten Teil lesen (Selector)
    const todos = yield select((state) => state.todos.items);
    const currentUser = yield select((state) => state.auth.user);
    
    // Logik basierend auf State
    if (todos.length > 10) {
        yield put(showWarning('Zu viele Todos!'));
    }
}
```

**Use Case:** Komplexe Business-Logik, die aktuellen State braucht

---

## **Exercise 12: Testing Sagas**

**Ziel:** Unit Tests für Sagas schreiben (ohne echte API Calls).

**Konzept:**
```typescript
import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

test('fetchTodosSaga lädt Todos erfolgreich', () => {
    const mockTodos = [{ id: '1', text: 'Test', completed: false }];
    
    return expectSaga(fetchTodosSaga)
        .provide([
            [call(todoService.fetchTodos), mockTodos] // Mock API
        ])
        .put(fetchTodosStart())
        .put(fetchTodosSuccess(mockTodos))
        .run();
});
```

**Tool:** `redux-saga-test-plan` (npm package)

---

## **Zusammenfassung: Wann welches Pattern?**

| Pattern | Use Case |
|---------|----------|
| **takeLatest** | Standard für API Calls (Auto-Cancellation) |
| **takeEvery** | Alle Actions verarbeiten (z.B. Analytics) |
| **debounce** | Search-Eingaben, Filter |
| **race** | Timeout für langsame APIs |
| **retry** | Instabile Netzwerke |
| **cancel** | Polling stoppen, komplexe Flows |
| **select** | State in Saga lesen |

---

## **Was du bereits gelernt hast (Exercise 1-5):**

✅ **Generator Functions** (`function*`, `yield`)  
✅ **Basic Effects** (`call`, `put`, `takeLatest`, `all`)  
✅ **Worker/Watcher Pattern**  
✅ **CRUD Operations** (Create, Read, Update, Delete)  
✅ **Optimistic Updates** mit Rollback  
✅ **select** Effect für State-Zugriff  

**Das ist die solide Basis!** Die Advanced Patterns kannst du implementieren, wenn du sie brauchst. 🚀
