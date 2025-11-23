import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initializeGoogleCalendarService, getGoogleCalendarService } from "../bookingRouter";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Initialiser le service Google Calendar OAuth2 au démarrage
  try {
    console.log("[Server] Initializing Google Calendar OAuth2 service...");
    await initializeGoogleCalendarService();
    console.log("[Server] ✅ Google Calendar OAuth2 service initialized");
  } catch (error) {
    console.warn("[Server] ⚠️ Google Calendar OAuth2 initialization failed:", error);
  }

  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Direct API endpoint for availabilities (before tRPC middleware)
  app.post("/api/availabilities", async (req, res) => {
    try {
      const service = getGoogleCalendarService();
      
      if (!service || !service.isInitialized) {
        return res.status(503).json({
          error: "Google Calendar service not available"
        });
      }
      
      const { startDate, endDate } = req.body;
      if (!startDate || !endDate) {
        return res.status(400).json({
          error: "Missing startDate or endDate"
        });
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const slotsByDate: Record<string, any[]> = {};
      
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const daySlots = await service.getAvailableSlots(new Date(currentDate), 60);
        
        if (daySlots.length > 0) {
          const dateStr = currentDate.toISOString().split('T')[0];
          slotsByDate[dateStr] = daySlots.map(slotTime => ({
            date: dateStr,
            startTime: slotTime,
            endTime: `${(parseInt(slotTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
            duration: 60,
            title: "Disponible (60 min)"
          }));
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      res.json({
        success: true,
        slotsByDate,
        availableDates: Object.keys(slotsByDate).sort()
      });
    } catch (error: any) {
      console.error("[API] Error fetching availabilities:", error);
      res.status(500).json({
        error: error.message || "Failed to fetch availabilities"
      });
    }
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "5000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
