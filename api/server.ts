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

// Routes API avec préfixe /api
app.use("/api/auth", authRoutes);
app.use("/api/practitioners", practitionersRoutes);
app.use("/api/timeslots", timeSlotsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/patients", patientsRoutes);

// Route de santé pour vérifier le serveur
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Route de base pour l'API
app.get("/api", (req, res) => {
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

// Handler pour Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise<void>((resolve, reject) => {
    // Middleware pour traiter la requête et envoyer la réponse
    app(req as any, res as any, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}