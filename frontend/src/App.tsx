// ============================================
// MAIN APP COMPONENT
// ============================================

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { loadUserFromStorage } from './features/auth/authSlice';
import { clearTodos } from './features/todos/todosSlice';

import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { Header } from './components/Header';
import { TodoList } from './components/Todos/TodoList';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [showRegister, setShowRegister] = useState(false);

  // User aus localStorage laden beim App-Start
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  // Todos clearen wenn User ausloggt
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(clearTodos());
    }
  }, [isAuthenticated, dispatch]);

  // Nicht eingeloggt -> Login/Register Forms
  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        {showRegister ? (
          <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
        )}

        <div style={styles.info}>
          <h3>📚 Redux Thunk Demo</h3>
          <p>
            Diese App demonstriert Redux Toolkit mit Redux Thunk Middleware für
            asynchrone Actions (API Calls).
          </p>
          <p><strong>Features:</strong></p>
          <ul style={styles.list}>
            <li>JWT Authentifizierung</li>
            <li>Todo CRUD Operations</li>
            <li>Redux Thunk für Async Logic</li>
            <li>TypeScript + React</li>
          </ul>
        </div>
      </div>
    );
  }

  // Eingeloggt -> Todo App
  return (
    <>
      <Header />
      <TodoList />
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '20px',
  } as React.CSSProperties,
  info: {
    maxWidth: '600px',
    margin: '30px auto',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  list: {
    marginLeft: '20px',
    lineHeight: 1.8,
  } as React.CSSProperties,
};

export default App;
