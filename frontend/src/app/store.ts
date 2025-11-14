// Redux Store mit allen drei Middlewares: Thunk, Saga und Observable
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import todosReducer from '../features/todos/todosSlice';

// Redux Saga Middleware
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { authRootSaga } from '../features/auth/authSagas';
import { todosRootSaga } from '../features/todos/todosSaga';

const sagaMiddleware = createSagaMiddleware();

// Redux-Observable Middleware
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { rootAuthEpic } from '../features/auth/authEpic';
import { rootTodosEpic } from '../features/todos/todosEpic';

const rootEpic = combineEpics(rootAuthEpic, rootTodosEpic);
const epicMiddleware = createEpicMiddleware();

function* rootSaga() {
    yield all([
        authRootSaga(),
        todosRootSaga()
    ]);
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    todos: todosReducer,
  },
  
  //       // Ignoriere Actions die nicht serializable sind
  //       ignoredActions: ['auth/authSuccess', 'todos/addTodo'],
  //     },
  //   }),
//     // DevTools im Development Mode
//   devTools: process.env.NODE_ENV !== 'production',
// });

  // ============================================
  // MIDDLEWARE CONFIGURATION
  // ============================================
  // Alle 3 Middlewares kombinieren:
  // - Thunk (Standard in getDefaultMiddleware)
  // - Saga (bereits hinzugefügt)
  // - Observable (TODO: hier hinzufügen)
  //
  // SCHRITTE:
  // 1. .concat(sagaMiddleware) ist bereits da
  // 2. Füge .concat(epicMiddleware) nach sagaMiddleware hinzu
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: {
        ignoredActions: ['auth/authSuccess', 'todos/addTodo'],
      },
    })
    .concat(sagaMiddleware)
    .concat(epicMiddleware)
  });
  
// ============================================
// TYPESCRIPT TYPES
// ============================================

// RootState Type (für useSelector)
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch Type (für useDispatch mit Thunks)
export type AppDispatch = typeof store.dispatch;

// ============================================
// FLUX ARCHITEKTUR ERKLÄRUNG
// ============================================
/**
 * FLUX PATTERN (Kapitel 4.1):
 * 
 * 1. VIEW (React Components)
 *    ↓ dispatch(action)
 * 
 * 2. ACTION (Event beschreibt was passiert)
 *    ↓
 * 
 * 3. DISPATCHER (Redux Store)
 *    ↓ durch Middleware (Thunk/Saga/Observable)
 * 
 * 4. STORE (Zentraler State)
 *    ↓ Reducer aktualisiert State
 * 
 * 5. VIEW (Re-Render mit neuem State)
 *    ↑ useSelector liest State
 * 
 * = Unidirektionaler Datenfluss!
 * = Vorhersagbar & testbar
 */


// ============================================
// MIDDLEWARE START
// ============================================
// Saga und Epic Middleware müssen NACH Store-Erstellung gestartet werden!

// Starte Redux Saga
sagaMiddleware.run(rootSaga);

// TODO: Starte Redux-Observable Epic Middleware
// Schritte:
// 1. epicMiddleware.run() aufrufen
// 2. rootEpic als Parameter übergeben
epicMiddleware.run(rootEpic);

// ============================================
// LOGGING
// ============================================
console.log('🏪 Redux Store erstellt mit Redux Toolkit');
console.log('✅ Middleware: Redux Thunk (Standard)');
console.log('✅ Middleware: Redux Saga (gestartet)');
console.log('✅ Middleware: Redux-Observable (gestartet)');
console.log('');
console.log('📚 Alle 3 Middleware-Arten werden gleichzeitig verwendet:');
console.log('   1. Thunk → Promises & Async/Await');
console.log('   2. Saga → Generators & Effects');
console.log('   3. Observable → RxJS Streams & Operators');


