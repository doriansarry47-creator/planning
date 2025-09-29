import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Import des routes
import authRoutes from '../server/routes/auth';
import practitionersRoutes from '../server/routes/practitioners';
import timeSlotsRoutes from '../server/routes/timeslots';
import appointmentsRoutes from '../server/routes/appointments';
import patientsRoutes from '../server/routes/patients';

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Configuration des middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuration CORS
app.use(cors({
  origin: true, // Permettre toutes les origines pour Vercel
  credentials: true,
}));

// Middleware de logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Routes API avec préfixe /api (que Vercel ajoutera automatiquement)
app.use("/auth", authRoutes);
app.use("/practitioners", practitionersRoutes);
app.use("/timeslots", timeSlotsRoutes);
app.use("/appointments", appointmentsRoutes);
app.use("/patients", patientsRoutes);

// Route de santé pour vérifier le serveur
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV
  });
});

// Route de base pour l'API
app.get("/", (req, res) => {
  res.json({ 
    message: "API Médicale - Gestion des rendez-vous",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      practitioners: "/api/practitioners",
      timeslots: "/api/timeslots", 
      appointments: "/api/appointments",
      patients: "/api/patients",
      health: "/api/health"
    }
  });
});

// Middleware de gestion d'erreurs
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  console.error('API Error:', err);
  res.status(status).json({ message });
});

// Handler pour Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise<void>((resolve, reject) => {
    // Middleware pour traiter la requête et envoyer la réponse
    app(req as any, res as any, (err: any) => {
      if (err) {
        console.error('Handler error:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}