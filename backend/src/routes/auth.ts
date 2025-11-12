// ============================================
// AUTH ROUTES
// ============================================

import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/auth/register - Neuen User registrieren
router.post('/register', register);

// POST /api/auth/login - User einloggen
router.post('/login', login);

// GET /api/auth/me - Aktuellen User holen (benötigt Auth)
router.get('/me', authenticate, getCurrentUser);

export default router;
