// ============================================
// TODO FILTER COMPONENT
// ============================================

import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setFilter } from '../../features/todos/todosSlice';
import { TodoFilter } from '../../types';

export const TodoFilters: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFilter = useAppSelector((state) => state.todos.filter);

  const filters: { label: string; value: TodoFilter }[] = [
    { label: 'Alle', value: 'all' },
    { label: 'Aktiv', value: 'active' },
    { label: 'Erledigt', value: 'completed' },
  ];

  return (
    <div style={styles.container}>
      <span style={styles.label}>Filter:</span>
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => dispatch(setFilter(filter.value))}
          style={{
            ...styles.button,
            ...(currentFilter === filter.value ? styles.activeButton : {}),
          }}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  } as React.CSSProperties,
  label: {
    fontWeight: 'bold' as const,
    fontSize: '16px',
  },
  button: {
    padding: '8px 16px',
    fontSize: '14px',
    backgroundColor: '#e9ecef',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  activeButton: {
    backgroundColor: '#007bff',
    color: 'white',
    borderColor: '#0056b3',
  } as React.CSSProperties,
};
