// ============================================
// TODO LIST COMPONENT
// ============================================

import React, { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchTodosThunk } from '../../features/todos/todosThunks';
import { fetchTodosRequest } from '../../features/todos/todosSagaActions';
import { TodoItem } from './TodoItem';
import { AddTodo } from './AddTodo';
import { TodoFilters } from './TodoFilters';

export const TodoList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, filter, loading, error } = useAppSelector((state) => state.todos);
  const { middlewareType } = useAppSelector((state) => state.auth);

  // Todos beim Mount laden - dynamisch je nach Login-Typ
  useEffect(() => {
    if (middlewareType === 'saga') {
      dispatch(fetchTodosRequest());
    } else {
      dispatch(fetchTodosThunk());
    }
  }, [dispatch, middlewareType]);

  // Gefilterte Todos (memoized für Performance)
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return items.filter((todo) => !todo.completed);
      case 'completed':
        return items.filter((todo) => todo.completed);
      default:
        return items;
    }
  }, [items, filter]);

  // Statistiken
  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, completed, active };
  }, [items]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        📝 Todo App - {middlewareType === 'saga' ? 'Redux Saga' : middlewareType === 'thunk' ? 'Redux Thunk' : 'Redux'}
      </h1>

      {/* Add Todo Form */}
      <AddTodo />

      {/* Filter Buttons */}
      <TodoFilters />

      {/* Statistiken */}
      <div style={styles.stats}>
        <span>Gesamt: {stats.total}</span>
        <span>Aktiv: {stats.active}</span>
        <span>Erledigt: {stats.completed}</span>
      </div>

      {/* Loading State */}
      {loading && <div style={styles.loading}>Lädt Todos...</div>}

      {/* Error State */}
      {error && <div style={styles.error}>Fehler: {error}</div>}

      {/* Todo Liste */}
      {!loading && filteredTodos.length === 0 && (
        <div style={styles.empty}>
          {filter === 'all' && 'Keine Todos vorhanden. Erstelle dein erstes Todo!'}
          {filter === 'active' && 'Keine aktiven Todos.'}
          {filter === 'completed' && 'Keine erledigten Todos.'}
        </div>
      )}

      <div style={styles.list}>
        {filteredTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  } as React.CSSProperties,
  title: {
    textAlign: 'center' as const,
    marginBottom: '30px',
    color: '#333',
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: 'bold' as const,
  } as React.CSSProperties,
  loading: {
    textAlign: 'center' as const,
    padding: '20px',
    color: '#6c757d',
    fontSize: '16px',
  } as React.CSSProperties,
  error: {
    textAlign: 'center' as const,
    padding: '15px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
    marginBottom: '20px',
  } as React.CSSProperties,
  empty: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#6c757d',
    fontSize: '16px',
  } as React.CSSProperties,
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
};
