// ============================================
// TODO CONTROLLER
// ============================================
// CRUD Operations für Todos

import { Request, Response } from 'express';
import TodoModel from '../models/Todo';
import { CreateTodoRequest, UpdateTodoRequest } from '../types';

/**
 * ALLE TODOS HOLEN
 * GET /api/todos
 */
export const getTodos = (req: Request, res: Response): void => {
  try {
    // User ID aus JWT Token (gesetzt durch auth middleware)
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Nicht authentifiziert.',
      });
      return;
    }

    const todos = TodoModel.findByUserId(userId);

    res.json({
      success: true,
      data: { todos },
    });
  } catch (error) {
    console.error('Get Todos Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server-Fehler beim Laden der Todos.',
    });
  }
};

/**
 * TODO ERSTELLEN
 * POST /api/todos
 */
export const createTodo = (req: Request, res: Response): void => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Nicht authentifiziert.',
      });
      return;
    }

    const { text }: CreateTodoRequest = req.body;

    if (!text || text.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Todo-Text darf nicht leer sein.',
      });
      return;
    }

    const todo = TodoModel.create(text.trim(), userId);

    res.status(201).json({
      success: true,
      data: { todo },
      message: 'Todo erfolgreich erstellt!',
    });
  } catch (error) {
    console.error('Create Todo Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server-Fehler beim Erstellen des Todos.',
    });
  }
};

/**
 * TODO AKTUALISIEREN
 * PUT /api/todos/:id
 */
export const updateTodo = (req: Request, res: Response): void => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Nicht authentifiziert.',
      });
      return;
    }

    const { id } = req.params;
    const updates: UpdateTodoRequest = req.body;

    // Prüfen ob Todo dem User gehört
    if (!TodoModel.belongsToUser(id, userId)) {
      res.status(404).json({
        success: false,
        error: 'Todo nicht gefunden oder keine Berechtigung.',
      });
      return;
    }

    const updatedTodo = TodoModel.update(id, updates);

    if (!updatedTodo) {
      res.status(404).json({
        success: false,
        error: 'Todo nicht gefunden.',
      });
      return;
    }

    res.json({
      success: true,
      data: { todo: updatedTodo },
      message: 'Todo erfolgreich aktualisiert!',
    });
  } catch (error) {
    console.error('Update Todo Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server-Fehler beim Aktualisieren des Todos.',
    });
  }
};

/**
 * TODO LÖSCHEN
 * DELETE /api/todos/:id
 */
export const deleteTodo = (req: Request, res: Response): void => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Nicht authentifiziert.',
      });
      return;
    }

    const { id } = req.params;

    // Prüfen ob Todo dem User gehört
    if (!TodoModel.belongsToUser(id, userId)) {
      res.status(404).json({
        success: false,
        error: 'Todo nicht gefunden oder keine Berechtigung.',
      });
      return;
    }

    const success = TodoModel.delete(id);

    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Todo nicht gefunden.',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Todo erfolgreich gelöscht!',
    });
  } catch (error) {
    console.error('Delete Todo Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server-Fehler beim Löschen des Todos.',
    });
  }
};

/**
 * TODO TOGGLE (completed Status umschalten)
 * PATCH /api/todos/:id/toggle
 */
export const toggleTodo = (req: Request, res: Response): void => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Nicht authentifiziert.',
      });
      return;
    }

    const { id } = req.params;

    // Prüfen ob Todo dem User gehört
    if (!TodoModel.belongsToUser(id, userId)) {
      res.status(404).json({
        success: false,
        error: 'Todo nicht gefunden oder keine Berechtigung.',
      });
      return;
    }

    const todo = TodoModel.findById(id);
    if (!todo) {
      res.status(404).json({
        success: false,
        error: 'Todo nicht gefunden.',
      });
      return;
    }

    // Toggle completed
    const updatedTodo = TodoModel.update(id, { completed: !todo.completed });

    res.json({
      success: true,
      data: { todo: updatedTodo },
      message: 'Todo-Status geändert!',
    });
  } catch (error) {
    console.error('Toggle Todo Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server-Fehler beim Ändern des Todo-Status.',
    });
  }
};
