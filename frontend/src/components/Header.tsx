// ============================================
// HEADER COMPONENT
// ============================================

import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    if (window.confirm('Wirklich ausloggen?')) {
      dispatch(logout());
    }
  };

  if (!isAuthenticated) return null;

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.userInfo}>
          <span style={styles.username}>👤 {user?.username}</span>
          <span style={styles.email}>({user?.email})</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '15px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  userInfo: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  } as React.CSSProperties,
  username: {
    fontWeight: 'bold' as const,
    fontSize: '16px',
  },
  email: {
    fontSize: '14px',
    opacity: 0.9,
  } as React.CSSProperties,
  logoutButton: {
    padding: '8px 20px',
    backgroundColor: 'white',
    color: '#007bff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
  } as React.CSSProperties,
};
