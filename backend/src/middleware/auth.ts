// ============================================
// JWT AUTHENTIFIZIERUNGS-MIDDLEWARE
// ============================================
// Prüft ob ein gültiges JWT-Token vorhanden ist
// und fügt User-Informationen zum Request hinzu

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

// Erweitere Express Request Type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// JWT Secret aus Umgebungsvariablen
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

/**
 * Middleware zur Authentifizierung
 * 
 * Erwartet Token im Authorization Header:
 * Authorization: Bearer <token>
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Token aus Header extrahieren
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Kein Token gefunden. Bitte einloggen.',
      });
      return;
    }

    // "Bearer " entfernen
    const token = authHeader.substring(7);

    // Token verifizieren
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // User-Info an Request anhängen
    req.user = decoded;

    // Weiter zur nächsten Middleware/Route
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Ungültiges Token. Bitte neu einloggen.',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token abgelaufen. Bitte neu einloggen.',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Server-Fehler bei der Authentifizierung.',
    });
  }
};
