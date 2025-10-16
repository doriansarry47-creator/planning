import express from 'express';
import cors from 'cors';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.API_PORT || 5000;

// Dynamic imports of API handlers
async function loadHandlers() {
  const authIndexModule = await import('./api/auth/index.js');
  const authLoginModule = await import('./api/auth/login.js');
  const authRegisterModule = await import('./api/auth/register.js');
  const authVerifyModule = await import('./api/auth/verify.js');
  const healthModule = await import('./api/health.js');
  const appointmentsModule = await import('./api/appointments/index.js');
  const practitionersModule = await import('./api/practitioners/index.js');
  
  return {
    authHandler: authIndexModule.default,
    authLoginHandler: authLoginModule.default,
    authRegisterHandler: authRegisterModule.default,
    authVerifyHandler: authVerifyModule.default,
    healthHandler: healthModule.default,
    appointmentsHandler: appointmentsModule.default,
    practitionersHandler: practitionersModule.default,
  };
}

// API routes - wrap handlers to convert Express req/res to Vercel req/res
const wrapHandler = (handler: any) => {
  return async (req: express.Request, res: express.Response) => {
    try {
      // Create Vercel-compatible request object
      const vercelReq: any = {
        ...req,
        query: req.query,
        body: req.body,
        headers: req.headers,
        method: req.method,
        url: req.url,
      };

      // Create Vercel-compatible response object
      const vercelRes: any = {
        status: (code: number) => {
          res.status(code);
          return vercelRes;
        },
        json: (data: any) => {
          res.json(data);
          return vercelRes;
        },
        send: (data: any) => {
          res.send(data);
          return vercelRes;
        },
        setHeader: (name: string, value: string) => {
          res.setHeader(name, value);
          return vercelRes;
        },
        end: () => {
          if (!res.headersSent) {
            res.end();
          }
          return vercelRes;
        },
      };

      await handler(vercelReq, vercelRes);
    } catch (error: any) {
      console.error('API Error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: error.message || 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
      }
    }
  };
};

async function startApiServer() {
  const app = express();
  
  const handlers = await loadHandlers();

  // Middleware
  app.use(cors({
    origin: '*',
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // Health check using new Vercel function
  app.get('/api/health', wrapHandler(handlers.healthHandler));

  // Mount API routes
  app.all('/api/auth', wrapHandler(handlers.authHandler));
  app.all('/api/auth/login', wrapHandler(handlers.authLoginHandler));
  app.all('/api/auth/register', wrapHandler(handlers.authRegisterHandler));
  app.all('/api/auth/verify', wrapHandler(handlers.authVerifyHandler));
  app.all('/api/appointments', wrapHandler(handlers.appointmentsHandler));
  app.all('/api/practitioners', wrapHandler(handlers.practitionersHandler));

  // Error handling
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  });

  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🔌  MedPlan API Server                             ║
║                                                       ║
║   ✅  API running on http://localhost:${PORT}          ║
║                                                       ║
║   📋  Endpoints:                                      ║
║   • GET  /api/health                                  ║
║   • POST /api/auth/login?userType=admin               ║
║   • POST /api/auth/login?userType=patient             ║
║   • POST /api/auth/register?userType=patient          ║
║   • GET  /api/auth/verify                             ║
║                                                       ║
║   📋  Test Accounts:                                  ║
║   👤  Admin:  doriansarry@yahoo.fr / admin123        ║
║   👥  Patient: patient.test@medplan.fr / patient123  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
  });
}

startApiServer().catch(console.error);