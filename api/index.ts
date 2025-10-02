import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from '../server/routes/auth.ts';
import practitionersRoutes from '../server/routes/practitioners.ts';
import appointmentsRoutes from '../server/routes/appointments.ts';
import patientsRoutes from '../server/routes/patients.ts';
import timeslotsRoutes from '../server/routes/timeslots.ts';
import availabilityRoutes from '../server/routes/availability.ts';

// Configure dotenv for production
dotenv.config();

// Configure environment variables for production if not already set
if (process.env.NODE_ENV === 'production') {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'medplan-jwt-secret-key-2024-production';
  process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'medplan-session-secret-2024-production';
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
}

// Create Express app
const app = express();

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Permettre toutes les origines en production Vercel
    : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Register routes (Vercel ajoute automatiquement le préfixe /api)
app.use('/auth', authRoutes);
app.use('/practitioners', practitionersRoutes);
app.use('/appointments', appointmentsRoutes);
app.use('/patients', patientsRoutes);
app.use('/timeslots', timeslotsRoutes);
app.use('/availability', availabilityRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      config: {
        jwt_configured: !!process.env.JWT_SECRET,
        db_configured: !!process.env.DATABASE_URL,
        session_configured: !!process.env.SESSION_SECRET,
        cors_enabled: true
      },
      api_endpoints: [
        '/api/health',
        '/api/auth/login/patient',
        '/api/auth/login/admin',
        '/api/auth/verify',
        '/api/practitioners',
        '/api/appointments',
        '/api/patients'
      ]
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// API info endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: "API Médicale - Gestion des rendez-vous",
    version: "1.0.0",
    status: "OK",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      practitioners: "/api/practitioners",
      timeslots: "/api/timeslots", 
      appointments: "/api/appointments",
      patients: "/api/patients",
      availability: "/api/availability"
    },
    env_check: {
      node_env: process.env.NODE_ENV,
      jwt_secret: !!process.env.JWT_SECRET,
      database_url: !!process.env.DATABASE_URL
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: `API endpoint ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise<void>((resolve, reject) => {
    try {
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.status(200).end();
        resolve();
        return;
      }

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          console.error('Request timeout after 25 seconds');
          res.status(408).json({ 
            error: 'Request timeout', 
            timestamp: new Date().toISOString() 
          });
        }
        reject(new Error('Request timeout'));
      }, 25000);

      // Convert Vercel request/response to Express format and handle
      app(req as any, res as any, (err: any) => {
        clearTimeout(timeout);
        
        if (err) {
          console.error('Vercel handler error:', {
            message: err.message,
            stack: err.stack,
            url: req.url,
            method: req.method,
            headers: req.headers,
            body: req.body,
          });
          
          if (!res.headersSent) {
            res.status(500).json({ 
              error: 'Internal Server Error',
              message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
              timestamp: new Date().toISOString() 
            });
          }
          reject(err);
        } else {
          resolve();
        }
      });
    } catch (error) {
      console.error('Handler setup error:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Server initialization error',
          timestamp: new Date().toISOString() 
        });
      }
      reject(error);
    }
  });
}