// ============================================
// TODO ITEM COMPONENT
// ============================================

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
// TODO EXERCISE 5: Importiere auch toggleTodoOptimisticRequest von todosSagaActions
import { toggleTodoRequest, deleteTodoRequest, toggleTodoOptimisticRequest, updateTodoRequest } from '../../features/todos/todosSagaActions';
import { toggleTodoThunk, deleteTodoThunk, updateTodoThunk } from '../../features/todos/todosThunks';
import { toggleTodoStart, deleteTodoStart, updateTodoStart } from '../../features/todos/todosSlice';
import { Todo } from '../../types';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const dispatch = useAppDispatch();
  const middlewareType = useAppSelector((state) => state.auth.middlewareType);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleToggle = () => {
    // Dynamisch: Saga oder Thunk basierend auf Login-Typ
    if (middlewareType === 'saga') {
      // TODO EXERCISE 5: Ändere hier von toggleTodoRequest zu toggleTodoOptimisticRequest
      // - dispatch(toggleTodoOptimisticRequest(todo.id))
      // - Dies nutzt dann die optimistic update Saga!
      dispatch(toggleTodoOptimisticRequest(todo.id));
    } else if (middlewareType === 'observable') {
      dispatch(toggleTodoStart({ id: todo.id }));
    } else {
      dispatch(toggleTodoThunk(todo.id));
    }
  };

  const handleDelete = () => {
    if (window.confirm('Todo wirklich löschen?')) {
      // Dynamisch: Saga oder Thunk basierend auf Login-Typ
      if (middlewareType === 'saga') {
        dispatch(deleteTodoRequest(todo.id));
      } else if (middlewareType === 'observable') {
        dispatch(deleteTodoStart({ id: todo.id }));
      } else {
        dispatch(deleteTodoThunk(todo.id));
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(todo.text);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== todo.text) {
      if (middlewareType === 'saga') {
        dispatch(updateTodoRequest(todo.id, { text: editText.trim() }));
      } else if (middlewareType === 'observable') {
        dispatch(updateTodoStart({ id: todo.id, updates: { text: editText.trim() } }));
      } else {
        dispatch(updateTodoThunk(todo.id, { text: editText.trim() }));
      }
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  return (
    <div style={styles.container}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        style={styles.checkbox}
      />

      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveEdit();
            if (e.key === 'Escape') handleCancelEdit();
          }}
          style={styles.editInput}
          autoFocus
        />
      ) : (
        <span
          style={{
            ...styles.text,
            textDecoration: todo.completed ? 'line-through' : 'none',
            color: todo.completed ? '#999' : '#333',
          }}
        >
          {todo.text}
        </span>
      )}

      <div style={styles.actions}>
        {isEditing ? (
          <>
            <button onClick={handleSaveEdit} style={styles.saveButton}>
              ✓
            </button>
            <button onClick={handleCancelEdit} style={styles.cancelButton}>
              ✗
            </button>
          </>
        ) : (
          <>
            <button onClick={handleEdit} style={styles.editButton}>
              ✏️
            </button>
            <button onClick={handleDelete} style={styles.deleteButton}>
              🗑️
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '4px',
    marginBottom: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  } as React.CSSProperties,
  text: {
    flex: 1,
    fontSize: '16px',
  } as React.CSSProperties,
  editInput: {
    flex: 1,
    padding: '8px',
    fontSize: '16px',
    border: '2px solid #007bff',
    borderRadius: '4px',
  } as React.CSSProperties,
  actions: {
    display: 'flex',
    gap: '8px',
  } as React.CSSProperties,
  editButton: {
    padding: '6px 12px',
    backgroundColor: '#ffc107',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  } as React.CSSProperties,
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  } as React.CSSProperties,
  saveButton: {
    padding: '6px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  } as React.CSSProperties,
  cancelButton: {
    padding: '6px 12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  } as React.CSSProperties,
};
