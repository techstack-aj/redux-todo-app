# ✅ State-Management mit RxJS - Redux Observable

**Kapitel:** State-Management mit RxJS - Redux Observable  
**Ziel:** Asynchrone Actions mit RxJS Observables und Epics verwalten

---

## ⏱️ Zeitaufwand

**Gesamt: ca. 2-3 Stunden** (je nach Vorkenntnissen)

- **Setup & Basis:** 30-45 Min
- **Todos Epics:** 45-60 Min  
- **Auth Epics:** 30-45 Min
- **Testing & Debugging:** 15-30 Min

**Breakdown:**
- Phase 1 (Setup): 15 Min
- Phase 2 (Basis-Epics): 45 Min
- Phase 3 (Search & Advanced): 20 Min
- Phase 4 (Auth-Epics): 30 Min
- Phase 5 (Integration): 15 Min
- Puffer für Debugging: 30 Min

---

## 📁 Erstellte Dateien

### **Neue Dateien mit Kommentaren:**
1. ✅ `frontend/src/features/todos/todosEpic.ts` - Todos Epics mit Kommentaren
2. ✅ `frontend/src/features/auth/authEpic.ts` - Auth Epics mit Kommentaren
3. ✅ `frontend/src/features/todos/todosEpicActions.ts` - Action-Definitionen
4. ✅ `frontend/src/features/auth/authEpicActions.ts` - Auth Action-Definitionen

### **Dokumentation:**
5. ✅ `OBSERVABLE_EXERCISES.md` - Detaillierter Übungsplan
6. ✅ `OBSERVABLE_QUICK_REFERENCE.md` - RxJS Operators Cheat Sheet

### **Modifizierte Dateien:**
7. ✅ `frontend/src/app/store.ts` - Kommentare für Epic Middleware hinzugefügt

---

## 🎯 Übungsreihenfolge (Empfohlen)

### **Teil 1: Setup (15 Min)**
**Datei:** `store.ts`

1. Epic Middleware importieren und erstellen
2. Root-Epic kombinieren
3. Epic Middleware zum Store hinzufügen
4. Epic Middleware starten

**Ziel:** Store läuft mit allen 3 Middlewares (Thunk, Saga, Observable)

---

### **Teil 2: Erste Todos-Epics (45 Min)**
**Datei:** `todosEpic.ts`

**Epic 1: Fetch Todos** (10 Min)
- Basis-Epic verstehen
- `filter` + `switchMap` + `map` + `catchError`
- Actions dispatchen

**Epic 2: Add Todo mit Debouncing** (10 Min)
- `debounceTime(500)` für verzögerte Eingabe
- User-Input optimieren

**Epic 3: Toggle Todo - Optimistisch** (15 Min)
- Sofort UI updaten
- API im Hintergrund
- Rollback bei Fehler mit `concat`

**Epic 4: Delete Todo mit Retry** (10 Min)
- `retry(3)` für automatische Wiederholungen
- `retryWhen` mit Delay für Backoff

**Ziel:** Verstehen von Debouncing, Retry, Optimistic Updates

---

### **Teil 3: Search & Advanced (20 Min)**
**Datei:** `todosEpic.ts`

**Epic 5: Search mit Debouncing**
- `debounceTime` + `distinctUntilChanged`
- `switchMap` für automatisches Canceling
- Min. 3 Zeichen Validierung mit `filter`

**Epic 6: Update mit Throttling**
- `throttleTime` für Rate-Limiting
- Max. 1 Request pro Sekunde

**Ziel:** Advanced Operators beherrschen

---

### **Teil 4: Auth-Epics (30 Min)**
**Datei:** `authEpic.ts`

**Epic 1: Login** (10 Min)
- API-Call mit `switchMap`
- Token in localStorage mit `tap`
- Success/Failure Actions

**Epic 2: Register** (10 Min)
- Validierung vor API-Call
- Auto-Login nach Registrierung
- Sequenzielle Actions mit `concat`

**Epic 3: Logout** (5 Min)
- Token aus localStorage entfernen
- State cleanup

**Epic 4: Auto-Logout** (5 Min - Bonus)
- `interval` für periodische Checks
- Token-Ablauf prüfen
- `takeUntil` für Cancellation

**Ziel:** Auth-Flow mit Observables verstehen

---

### **Teil 5: Integration (15 Min)**
**Dateien:** `todosSlice.ts`, `authSlice.ts`, Komponenten

1. Actions zu Slices hinzufügen (aus `*EpicActions.ts`)
2. In Komponenten verwenden
3. Testen im Browser

**Ziel:** Alle Epics funktionieren zusammen

---

## 📝 Schritt-für-Schritt Anleitung

### **Start: Store Setup**

1. Öffne `store.ts`
2. Kommentare durchlesen
3. Imports aktivieren:
   ```typescript
   import { createEpicMiddleware, combineEpics } from 'redux-observable';
   import { rootAuthEpic } from '../features/auth/authEpic';
   import { rootTodosEpic } from '../features/todos/todosEpic';
   ```
4. Epic Middleware erstellen
5. Zum Store hinzufügen
6. Nach Store-Erstellung starten

### **Danach: Erster Epic**

1. Öffne `todosEpic.ts`
2. Gehe zu `EPIC 1: FETCH TODOS`
3. Lese Kommentare durch
4. Implementiere Schritt für Schritt:
   - Filter auf Action-Type
   - switchMap für API-Call
   - map zu Success-Action
   - catchError für Fehler
5. Epic exportieren
6. Zu `rootTodosEpic` hinzufügen

### **Test im Browser**

1. Komponente dispatcht `fetchTodosRequest`
2. Epic fängt Action ab
3. Macht API-Call
4. Dispatcht `fetchTodosSuccess`
5. UI updated

---

## 🎓 Lernziele Check

Nach Abschluss solltest du können:

- ✅ Epic Middleware konfigurieren
- ✅ Observables erstellen und transformieren
- ✅ RxJS Operators verwenden (map, filter, switchMap, mergeMap, etc.)
- ✅ Debouncing & Throttling implementieren
- ✅ Error-Handling mit catchError
- ✅ Retry-Logik mit retry/retryWhen
- ✅ Optimistische Updates mit Rollback
- ✅ Interval-basierte Checks (Auto-Logout)
- ✅ Alle 3 Middlewares parallel nutzen

---

## 💡 Wichtige Konzepte

### **1. Observables vs Promises**
- Promise: 1 Wert, dann fertig
- Observable: Stream von Werten über Zeit

### **2. Operators**
- Transformation: `map`, `switchMap`, `mergeMap`, `concatMap`
- Filtering: `filter`, `debounceTime`, `throttleTime`
- Error: `catchError`, `retry`, `retryWhen`

### **3. Epic Flow**
```
Component → dispatch(action)
     ↓
Epic fängt Action ab
     ↓
Observable-Pipeline (Operators)
     ↓
API-Call / Side-Effects
     ↓
dispatch(successAction / failureAction)
     ↓
Reducer updated State
     ↓
Component re-rendert
```

### **4. switchMap vs mergeMap vs concatMap**
- `switchMap`: Cancelt alte Requests (gut für Search)
- `mergeMap`: Parallele Requests (gut für Add/Update)
- `concatMap`: Sequenzielle Requests (gut für Queue)

---

## 🔍 Debugging-Tipps

```typescript
// 1. Console-Logging
.pipe(
  tap(x => console.log('Value:', x)),
  map(...),
)

// 2. Action-Logging
action$.pipe(
  tap(action => console.log('Action:', action.type)),
)

// 3. Error-Logging
catchError(error => {
  console.error('Epic Error:', error);
  return of(someFailureAction(error.message));
})
```

---

## 📦 Dependencies Check

Bereits installiert:
- ✅ `redux-observable@^3.0.0-rc.2`
- ✅ `rxjs@^7.8.1`
- ✅ `@reduxjs/toolkit@^2.0.1`
- ✅ `redux-saga@^1.4.2` (parallel verwendbar!)
- ✅ `redux-thunk@^3.1.0` (parallel verwendbar!)

Keine zusätzliche Installation nötig! 🎉

---

## 🚀 Nächste Schritte

1. ✅ Store-Setup durchführen (`store.ts`)
2. ✅ Ersten Epic implementieren (`fetchTodosEpic`)
3. ✅ Im Browser testen
4. ✅ Weitere Epics nacheinander implementieren
5. ✅ Actions zu Slices hinzufügen
6. ✅ In Komponenten integrieren

---

## 📞 Hilfe

Bei Problemen:
1. Kommentare in den Epic-Dateien nochmal lesen
2. `OBSERVABLE_QUICK_REFERENCE.md` für Operator-Syntax
3. `REDUX_OBSERVABLE_THEORIE.md` für Konzepte
4. RxJS Marbles: https://rxmarbles.com/ (Visualisierung)

---

**Viel Erfolg! Du schaffst das! 💪🚀**

Du hast jetzt alle Tools:
- ✅ Kommentare in Code-Dateien (wo was zu tun ist)
- ✅ Detaillierte Übungsanleitungen
- ✅ Quick-Reference für Operators
- ✅ Action-Definitionen
- ✅ Theorie-Dokument

**Los geht's mit dem Store-Setup!** 🎯
