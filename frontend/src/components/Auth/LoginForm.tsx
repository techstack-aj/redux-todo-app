// ============================================
// LOGIN COMPONENT
// ============================================

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { loginThunk } from '../../features/auth/authThunks';
import { loginRequest } from '../../features/auth/authSagaActions';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email && password) {
      dispatch(loginThunk({ email, password }));
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Lädt...' : 'Login (Thunk)'}
        </button>
        <button
          type="button"
          onClick={() => dispatch(loginRequest({ email, password }))}
          disabled={loading}
          style={styles.button}
        >
          Login (Saga)
        </button>
      </form>

      <p style={styles.switch}>
        Noch kein Account?{' '}
        <button onClick={onSwitchToRegister} style={styles.linkButton}>
          Registrieren
        </button>
      </p>
    </div>
  );
};

// Simple Inline Styles
const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '30px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  } as React.CSSProperties,
  button: {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  } as React.CSSProperties,
  error: {
    color: '#dc3545',
    fontSize: '14px',
    padding: '8px',
    backgroundColor: '#f8d7da',
    borderRadius: '4px',
  } as React.CSSProperties,
  switch: {
    marginTop: '20px',
    textAlign: 'center' as const,
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
    font: 'inherit',
  } as React.CSSProperties,
};
