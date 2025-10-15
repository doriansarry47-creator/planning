import express from 'express';
import cors from 'cors';
import { createServer } from 'vite';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import API handlers
import authHandler from './api/auth/index.js';
import appointmentsHandler from './api/appointments/index.js';
import practitionersHandler from './api/practitioners/index.js';

const PORT = process.env.PORT || 5173;

async function startDevServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Request logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });

  // API routes - simulate Vercel request/response
  app.all('/api/auth', async (req, res) => {
    try {
      const vercelReq = req as unknown as VercelRequest;
      vercelReq.query = { ...req.query };
      const vercelRes = res as unknown as VercelResponse;
      await authHandler(vercelReq, vercelRes);
    } catch (error) {
      console.error('Auth API error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  app.all('/api/appointments', async (req, res) => {
    try {
      const vercelReq = req as unknown as VercelRequest;
      vercelReq.query = { ...req.query };
      const vercelRes = res as unknown as VercelResponse;
      await appointmentsHandler(vercelReq, vercelRes);
    } catch (error) {
      console.error('Appointments API error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  app.all('/api/practitioners', async (req, res) => {
    try {
      const vercelReq = req as unknown as VercelRequest;
      vercelReq.query = { ...req.query };
      const vercelRes = res as unknown as VercelResponse;
      await practitionersHandler(vercelReq, vercelRes);
    } catch (error) {
      console.error('Practitioners API error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Create Vite server in middleware mode
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🏥  MedPlan Development Server                     ║
║                                                       ║
║   ✅  Server running on http://localhost:${PORT}        ║
║   ✅  API available at http://localhost:${PORT}/api   ║
║                                                       ║
║   📋  Test Accounts:                                  ║
║   👤  Admin:  doriansarry@yahoo.fr / admin123        ║
║   👥  Patient: patient.test@medplan.fr / patient123  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
  });
}

startDevServer().catch(console.error);
