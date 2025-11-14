# 🌊 State-Management mit RxJS - Redux Observable

## 📚 Übersicht

**Kapitel:** State-Management mit RxJS - Redux Observable  
**Thema:** Asynchrone State-Verwaltung mit Observables und reaktiver Programmierung

Du wirst jetzt Redux-Observable (Epics) implementieren, um asynchrone Actions mit RxJS Observables zu handhaben.

---

## ✅ Voraussetzungen

- ✅ `redux-observable` ist bereits installiert
- ✅ `rxjs` ist bereits installiert
- ✅ Thunks sind implementiert
- ✅ Sagas sind implementiert

---

## 🎯 Lernziele

Nach diesen Übungen kannst du:
1. **Epics** erstellen und mit RxJS Operators arbeiten
2. **Debouncing** und **Throttling** für User-Input implementieren
3. **Retry-Logik** bei fehlgeschlagenen API-Requests einbauen
4. **Observable-Streams** kombinieren und transformieren
5. Alle 3 Middlewares (Thunk, Saga, Observable) parallel nutzen

---

## 📝 Übungsstruktur

### **Übung 1: Setup & Basis-Epic (20 Min)**
- Epic Middleware zum Store hinzufügen
- Ersten Epic für `fetchTodos` erstellen
- Actions dispatchen und Observable-Flow verstehen

**Dateien:**
- `frontend/src/app/store.ts` (erweitern)
- `frontend/src/features/todos/todosEpic.ts` (neu)

---

### **Übung 2: Debouncing & User Input (15 Min)**
- Search-Input mit Debouncing (500ms Verzögerung)
- Nur gültige Suchanfragen durchlassen (min. 3 Zeichen)
- Loading-States verwalten

**Konzepte:**
- `debounceTime(500)`
- `filter(query => query.length >= 3)`
- `switchMap` für automatisches Canceling

**Dateien:**
- `frontend/src/features/todos/todosEpic.ts`
- `frontend/src/features/todos/todosSlice.ts` (neue Actions)

---

### **Übung 3: Optimistisches Update mit Rollback (20 Min)**
- Todo togglen (completed) → sofort UI updaten
- API-Request im Hintergrund
- Bei Fehler: Rollback zum vorherigen State

**Konzepte:**
- Zwei Actions: `toggleTodoOptimistic` und `toggleTodoConfirm`
- `mergeMap` für parallele Requests
- `catchError` für Rollback

**Dateien:**
- `frontend/src/features/todos/todosEpic.ts`

---

### **Übung 4: Retry-Logik bei Netzwerkfehlern (15 Min)**
- Delete Todo mit automatischem Retry (3 Versuche)
- Exponentielles Backoff (1s, 2s, 4s)
- Nach 3 Fehlern: Error anzeigen

**Konzepte:**
- `retry(3)`
- `retryWhen` mit Delay
- Error-Handling

**Dateien:**
- `frontend/src/features/todos/todosEpic.ts`

---

### **Übung 5: Auth Epics (20 Min)**
- Login Epic mit Token-Speicherung
- Auto-Logout bei abgelaufenem Token
- Token-Refresh mit `interval`

**Konzepte:**
- `tap` für Side-Effects (localStorage)
- `interval` für periodische Checks
- `takeUntil` für Cancellation

**Dateien:**
- `frontend/src/features/auth/authEpic.ts` (neu)

---

### **Übung 6: Epic-Kombination (15 Min)**
- Mehrere Epics kombinieren mit `combineEpics`
- Error-Boundary für alle Epics
- Global Error-Handling

**Konzepte:**
- `combineEpics(...allEpics)`
- `catchError` auf Root-Level
- Action-Filtering

**Dateien:**
- `frontend/src/app/store.ts`

---

## 🎓 Bonus-Übungen (Optional)

### **Bonus 1: WebSocket mit Observable**
- Live-Updates von anderen Clients
- Observable aus WebSocket-Events erstellen
- Reconnect-Logik bei Verbindungsabbruch

### **Bonus 2: Undo/Redo mit Observable**
- Action-History als Stream
- Time-Travel Debugging
- `scan` für State-Accumulation

### **Bonus 3: Drag & Drop mit Observable**
- Mouse-Events als Observable
- `takeUntil` für MouseUp
- Position-Tracking mit `map`

---

## 🔍 Hilfreiche RxJS Operators

### Transformation
- `map` - Wert transformieren
- `switchMap` - Inner Observable, automatisches Cancel
- `mergeMap` - Parallele Inner Observables
- `concatMap` - Sequenzielle Inner Observables

### Filtering
- `filter` - Werte filtern
- `debounceTime` - Verzögerung nach letztem Event
- `throttleTime` - Max. 1 Wert pro Zeitspanne
- `distinctUntilChanged` - Nur bei Änderung

### Error-Handling
- `catchError` - Fehler abfangen
- `retry` - Automatisch wiederholen
- `retryWhen` - Wiederholen mit Logik

### Kombination
- `merge` - Mehrere Streams parallel
- `concat` - Mehrere Streams nacheinander
- `combineLatest` - Kombiniert letzte Werte

### Utility
- `tap` - Side-Effects (z.B. logging)
- `delay` - Verzögerung einfügen
- `takeUntil` - Bis anderer Stream emittiert

---

## 📖 Dokumentation

- **RxJS Docs:** https://rxjs.dev/
- **Redux-Observable Docs:** https://redux-observable.js.org/
- **RxJS Marbles (Visualisierung):** https://rxmarbles.com/

---

## 💡 Tipps

1. **Naming:** Epics enden mit `Epic` (z.B. `fetchTodosEpic`)
2. **Konvention:** Observables mit `$` suffix (z.B. `action$`)
3. **Debugging:** `tap(console.log)` für Stream-Debugging
4. **Type-Safety:** Action-Types mit `ofType` filtern
5. **Testing:** Observables mit `TestScheduler` testen

---

Viel Erfolg! 🚀
