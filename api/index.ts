import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import des routes
import authRoutes from '../server/routes/auth';
import practitionersRoutes from '../server/routes/practitioners';
import { timeSlotsRouter } from '../server/routes/timeslots';
import appointmentsRoutes from '../server/routes/appointments';
import patientsRoutes from '../server/routes/patients';
import { availabilityRouter } from '../server/routes/availability';

dotenv.config();

const app = express();

// Configuration CORS pour Vercel
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Accepter toutes les origines en production pour Vercel
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session simplifiée pour Vercel (en mémoire)
import session from 'express-session';
app.use(
  session({
    secret: process.env.SESSION_SECRET || "vercel-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  }),
);

// Routes API
app.use("/auth", authRoutes);
app.use("/practitioners", practitionersRoutes);
app.use("/timeslots", timeSlotsRouter);
app.use("/appointments", appointmentsRoutes);
app.use("/patients", patientsRoutes);
app.use("/availability", availabilityRouter);

// Route de santé
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    platform: "Vercel"
  });
});

// Route de base
app.get("/", (req, res) => {
  res.json({ 
    message: "API Médicale - Gestion des rendez-vous",
    version: "1.0.0",
    platform: "Vercel",
    endpoints: {
      auth: "/api/auth",
      practitioners: "/api/practitioners",
      timeslots: "/api/timeslots", 
      appointments: "/api/appointments",
      patients: "/api/patients",
      availability: "/api/availability",
      health: "/api/health"
    }
  });
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (err?: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}