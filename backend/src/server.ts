// ============================================
// EXPRESS SERVER SETUP
// ============================================
// Hauptserver-Datei mit CORS, Routes und Error Handling

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import todoRoutes from './routes/todos';

// Umgebungsvariablen laden
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// CORS aktivieren (für Frontend-Zugriff)
app.use(cors({
  origin: 'http://localhost:5173', // Vite Dev Server
  credentials: true,
}));

// JSON Body Parser
app.use(express.json());

// Request Logging (Development)
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server läuft!',
    timestamp: new Date().toISOString(),
  });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Todo Routes
app.use('/api/todos', todoRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route nicht gefunden.',
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Interner Server-Fehler.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============================================
// SERVER START
// ============================================
app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(50));
  console.log('🚀 TODO BACKEND SERVER');
  console.log('='.repeat(50));
  console.log(`📡 Server läuft auf: http://localhost:${PORT}`);
  console.log(`🔧 Umgebung: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 Health Check: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
  console.log('');
});
