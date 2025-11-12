// ============================================
// AUTH CONTROLLER
// ============================================
// Handles Login und Registrierung mit JWT

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User';
import { LoginRequest, RegisterRequest, JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = '7d'; // Token gültig für 7 Tage

/**
 * REGISTRIERUNG
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password }: RegisterRequest = req.body;

    // Validierung
    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Bitte alle Felder ausfüllen.',
      });
      return;
    }

    // Prüfen ob Email bereits existiert
    const existingUser = UserModel.findByEmail(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'Email bereits registriert.',
      });
      return;
    }

    // Passwort hashen (10 Salt Rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // User erstellen
    const user = UserModel.create({
      username,
      email,
      password: hashedPassword,
    });

    // JWT Token erstellen
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Response (ohne Passwort!)
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      message: 'Registrierung erfolgreich!',
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server-Fehler bei der Registrierung.',
    });
  }
};

/**
 * LOGIN
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validierung
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Bitte Email und Passwort eingeben.',
      });
      return;
    }

    // User finden
    const user = UserModel.findByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Ungültige Anmeldedaten.',
      });
      return;
    }

    // Passwort prüfen
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Ungültige Anmeldedaten.',
      });
      return;
    }

    // JWT Token erstellen
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Response
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      message: 'Login erfolgreich!',
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server-Fehler beim Login.',
    });
  }
};

/**
 * AKTUELLEN USER HOLEN
 * GET /api/auth/me
 * Benötigt Auth Middleware
 */
export const getCurrentUser = (req: Request, res: Response): void => {
  // req.user wurde durch auth middleware gesetzt
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Nicht authentifiziert.',
    });
    return;
  }

  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
};
