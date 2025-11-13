// ============================================
// REDUX STORE CONFIGURATION
// ============================================
// Zentraler Redux Store mit Redux Toolkit
// 
// WICHTIG FÜR ABSCHLUSSPROJEKT:
// Hier werden später ALLE 3 Middleware kombiniert:
// 1. Redux Thunk (Standard in Redux Toolkit) ✅
// 2. Redux Saga (Tag 2 Vormittag) 🔄
// 3. Redux Observable (Tag 2 Nachmittag) 🔄

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import todosReducer from '../features/todos/todosSlice';

// für Redux Saga
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { authRootSaga } from '../features/auth/authSagas';
import { todosRootSaga } from '../features/todos/todosSaga';

const sagaMiddleware = createSagaMiddleware();

// Root Saga kombiniert alle Feature-Sagas
function* rootSaga() {
    yield all([
        authRootSaga(),
        todosRootSaga()
    ]);
}

// Store mit Saga Middleware konfigurieren
// später

// ============================================
// STORE CONFIGURATION
// ============================================
export const store = configureStore({
  reducer: {
    auth: authReducer,
    todos: todosReducer,
  },
  
  // Redux Thunk ist standardmäßig in Redux Toolkit inkludiert!
  // Keine extra Konfiguration nötig
  
  // Thunk: Middleware-Konfiguration (später erweitert für Saga + Observable)
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({
  //     // Thunk ist bereits dabei
  //     thunk: true,
      
  //     // SerializableCheck für Dev Mode
  //     serializableCheck: {
  //       // Ignoriere Actions die nicht serializable sind
  //       ignoredActions: ['auth/authSuccess', 'todos/addTodo'],
  //     },
  //   }),
//     // DevTools im Development Mode
//   devTools: process.env.NODE_ENV !== 'production',
// });

  // Füge Saga Middleware hinzu
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: {
        ignoredActions: ['auth/authSuccess', 'todos/addTodo'],
      },
    }).concat(sagaMiddleware), // Saga Middleware hinzufügen
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


// Starte die Root Saga
sagaMiddleware.run(rootSaga);
console.log('🏪 Redux Store erstellt mit Redux Toolkit');
//console.log('✅ Middleware: Redux Thunk (Standard)');
console.log('✅ Redux Saga Middleware gestartet');
console.log('🔄 Später: Redux Saga & Redux Observable');


