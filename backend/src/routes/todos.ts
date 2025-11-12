// ============================================
// TODO ROUTES
// ============================================

import { Router } from 'express';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
} from '../controllers/todoController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Alle Routes benötigen Authentifizierung
router.use(authenticate);

// GET /api/todos - Alle Todos holen
router.get('/', getTodos);

// POST /api/todos - Neues Todo erstellen
router.post('/', createTodo);

// PUT /api/todos/:id - Todo aktualisieren
router.put('/:id', updateTodo);

// DELETE /api/todos/:id - Todo löschen
router.delete('/:id', deleteTodo);

// PATCH /api/todos/:id/toggle - Todo completed-Status togglen
router.patch('/:id/toggle', toggleTodo);

export default router;
