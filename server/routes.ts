import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";

// Import des routes
import authRoutes from "./routes/auth";
import practitionersRoutes from "./routes/practitioners";
import timeSlotsRoutes from "./routes/timeslots";
import appointmentsRoutes from "./routes/appointments";
import patientsRoutes from "./routes/patients";
import availabilityRoutes from "./routes/availability";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configuration CORS
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.vercel.app'] // Remplacer par votre domaine Vercel
      : ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true,
  }));

  // Routes API avec préfixe /api
  app.use("/api/auth", authRoutes);
  app.use("/api/practitioners", practitionersRoutes);
  app.use("/api/timeslots", timeSlotsRoutes);
  app.use("/api/appointments", appointmentsRoutes);
  app.use("/api/patients", patientsRoutes);
  app.use("/api/availability", availabilityRoutes);

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
        availability: "/api/availability",
        health: "/api/health"
      }
    });
  });

  // Gestionnaire 404 pour les routes API - TOUJOURS renvoyer du JSON
  app.use("/api/*", (req, res) => {
    res.status(404).json({
      error: "Route API non trouvée",
      path: req.path,
      method: req.method,
      message: `L'endpoint ${req.method} ${req.path} n'existe pas`,
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        "/api/health",
        "/api/auth/*",
        "/api/practitioners/*",
        "/api/timeslots/*",
        "/api/appointments/*",
        "/api/patients/*",
        "/api/availability/*"
      ]
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
