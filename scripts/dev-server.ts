// Script de démarrage pour le serveur de développement avec SQLite

// IMPORTANT: Charger les variables d'environnement EN PREMIER
import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes-dev.js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const log = console.log;
import session from "express-session";

const app = express();

// Configuration session simplifiée pour le développement SQLite
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: false,
      httpOnly: true,
    },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Server Error:", err);
    
    // TOUJOURS renvoyer du JSON pour les routes API
    if (req.path.startsWith('/api')) {
      res.status(status).json({ 
        error: message,
        status,
        path: req.path,
        timestamp: new Date().toISOString()
      });
    } else {
      // Pour les autres routes, renvoyer le HTML d'erreur standard
      res.status(status).json({ message });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  // Servir les fichiers statiques React compilés
  const publicPath = path.join(__dirname, '../public');
  log(`Serving static files from: ${publicPath}`);
  app.use(express.static(publicPath));
  
  // Route catch-all pour servir React pour toutes les routes non-API
  app.get('*', (req, res) => {
    // Ne pas intercepter les routes API
    if (req.path.startsWith('/api')) {
      return;
    }
    const indexPath = path.join(publicPath, 'index.html');
    log(`Serving index.html from: ${indexPath}`);
    res.sendFile(indexPath);
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`\n🚀 Serveur de développement démarré!`);
    log(`📊 API endpoint: http://localhost:${port}/api`);
    log(`🌐 Frontend: http://localhost:${port}`);
    log(`💾 Base de données: SQLite (dev.db)`);
    log(`\n📋 Comptes de test:`);
    log(`👤 Admin: admin@medical.fr / admin123`);
    log(`🧑‍🤝‍🧑 Patient: patient@test.fr / patient123\n`);
  });
})();