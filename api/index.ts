'''import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? 'Bearer ***' : 'none'
    },
    body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined
  });
  next();
});

// Register routes (Vercel ajoute automatiquement le préfixe /api)
// Routes will be loaded dynamically to avoid compilation issues
let routesLoaded = false;

async function loadRoutes() {
  if (routesLoaded) return;
  
  try {
    const { default: authRoutes } = await import('../server/routes/auth.js');
    const { default: practitionersRoutes } = await import('../server/routes/practitioners.js');
    const { default: appointmentsRoutes } = await import('../server/routes/appointments.js');
    const { default: patientsRoutes } = await import('../server/routes/patients.js');
    const { default: timeslotsRoutes } = await import('../server/routes/timeslots.js');
    const { default: availabilityRoutes } = await import('../server/routes/availability.js');
    
    app.use("/api/auth", authRoutes);
    app.use("/api/practitioners", practitionersRoutes);
    app.use("/api/appointments", appointmentsRoutes);
    app.use("/api/patients", patientsRoutes);
    app.use("/api/timeslots", timeslotsRoutes);
    app.use("/api/availability", availabilityRoutes);
    
    routesLoaded = true;
    console.log("✅ Routes loaded successfully");
  } catch (error) {
    console.error("❌ Error loading routes:", error);
    throw error;
  }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
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
        '/api/auth/register/patient',
        '/api/auth/register/admin',
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
app.get("/api", (req, res) => {
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
  const fullPath = req.url;
  res.status(404).json({
    error: `API endpoint ${fullPath} not found`,
    timestamp: new Date().toISOString()
  });
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise<void>(async (resolve, reject) => {
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
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          console.error('Request timeout after 10 seconds');
          res.status(408).json({ 
            error: 'Request timeout', 
            timestamp: new Date().toISOString() 
          });
        }
        reject(new Error('Request timeout'));
      }, 30000);

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
'''
