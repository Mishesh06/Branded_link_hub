import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { errorHandler, AppError } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/authRoutes';
import linkRoutes from './routes/linkRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import bioRoutes from './routes/bioRoutes';
import redirectRoutes from './routes/redirectRoutes';

export const createApp = () => {
  const app = express();

  // Trust proxy for rate limiting and IP detection behind reverse proxies
  app.set('trust proxy', 1);

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // allow standard redirects and inline previews
      crossOriginEmbedderPolicy: false
    })
  );

  // CORS configuration for credentials and httpOnly cookies
  const configuredOrigins = env.CLIENT_URL
    ? env.CLIENT_URL.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const devOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5001',
    'http://127.0.0.1:5001'
  ];

  const allowedOrigins = Array.from(
    new Set(
      (env.NODE_ENV === 'production'
        ? configuredOrigins
        : [...configuredOrigins, ...devOrigins]
      ).filter(Boolean)
    )
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps, curl, or same-origin redirects)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new AppError(`CORS policy violation: Origin '${origin}' is not authorized.`, 403));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    })
  );

  // Parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'branded-link-hub-api'
    });
  });

  // Short-link Redirection Engine (Root prefix /r)
  app.use('/r', redirectRoutes);

  // Core REST API v1
  app.use('/api/v1', apiLimiter);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/links', linkRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);
  app.use('/api/v1/bio', bioRoutes);

  // Serve client static build when present
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/r/')) {
        return next();
      }
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  // Fallback 404 for unknown API routes
  app.use('/api/*', (_req, res) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};
