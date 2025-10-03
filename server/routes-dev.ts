import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";

// Import des routes (modifiées pour utiliser SQLite)
import authRoutes from "./routes/auth-dev.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configuration CORS
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5000'],
    credentials: true,
  }));

  // Routes API avec préfixe /api
  app.use("/api/auth", authRoutes);

  // Route de santé pour vérifier le serveur
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "OK", 
      environment: "development",
      database: "SQLite",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  });

  // Route de base pour l'API
  app.get("/api", (req, res) => {
    res.json({ 
      message: "API Médicale - Gestion des rendez-vous (Développement)",
      environment: "development",
      database: "SQLite",
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
        "/api/auth/register/patient",
        "/api/auth/login/patient", 
        "/api/auth/register/admin",
        "/api/auth/login/admin",
        "/api/auth/verify",
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