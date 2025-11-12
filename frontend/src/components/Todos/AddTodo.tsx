// ============================================
// ADD TODO COMPONENT
// ============================================

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createTodoThunk } from '../../features/todos/todosThunks';

export const AddTodo: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.todos);

  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (text.trim()) {
      dispatch(createTodoThunk(text.trim()));
      setText(''); // Input clearen
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        placeholder="Neues Todo eingeben..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={styles.input}
        disabled={loading}
      />
      <button type="submit" disabled={loading || !text.trim()} style={styles.button}>
        {loading ? 'Lädt...' : 'Hinzufügen'}
      </button>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  } as React.CSSProperties,
  input: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '4px',
  } as React.CSSProperties,
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  } as React.CSSProperties,
};
