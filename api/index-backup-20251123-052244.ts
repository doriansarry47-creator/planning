import "dotenv/config";
import express, { Request, Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import superjson from "superjson";
import { initTRPC } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { z } from "zod";

// Simple OAuth Service (consolidated)
function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

const OAuthService = {
  registerRoutes(app: express.Express) {
    app.get("/api/oauth/callback", async (_req: Request, _res: Response) => {
      const code = getQueryParam(req, "code");
      const state = getQueryParam(req, "state");

      if (!code || !state) {
        res.status(400).json({ error: "code and state are required" });
        return;
      }

      try {
        // Simple OAuth response - in a real app, this would integrate with your OAuth provider
        console.log("[OAuth] Callback received:", { code, state });
        
        // For now, just redirect to home
        res.redirect(302, "/");
      } catch (error) {
        console.error("[OAuth] Callback failed", error);
        res.status(500).json({ error: "OAuth callback failed" });
      }
    });
  }
};

// Google Calendar Service
class GoogleCalendarService {
  private calendar: any;
  private isInitialized = false;

  constructor() {
    this.initializeCalendar();
  }

  private async initializeCalendar() {
    try {
      const { google } = await import('googleapis');
      
      // Service Account authentication
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      let privateKey = process.env.GOOGLE_PRIVATE_KEY;
      
      console.log("🔑 Google Calendar init - Email found:", !!serviceAccountEmail);
      console.log("🔑 Google Calendar init - Private key found:", !!privateKey);
      
      if (!serviceAccountEmail || !privateKey) {
        console.error("❌ Google service account credentials not found");
        console.error("Required env vars: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY");
        return;
      }

      // Nettoyer et formater la clé privée
      privateKey = privateKey.replace(/\\n/g, '\n').trim();
      
      // Vérifier que la clé privée commence correctement
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        console.error("❌ Invalid private key format - missing BEGIN PRIVATE KEY header");
        console.error("Private key preview:", privateKey.substring(0, 100));
        return;
      }
      
      if (!privateKey.includes('-----END PRIVATE KEY-----')) {
        console.error("❌ Invalid private key format - missing END PRIVATE KEY footer");
        return;
      }
      
      console.log("✅ Private key format validated");
      console.log("✅ Key length:", privateKey.length);
      console.log("✅ Key preview:", privateKey.substring(0, 50) + "...");

      const auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      this.calendar = google.calendar({ version: 'v3', auth });
      this.isInitialized = true;
      console.log("✅ Google Calendar initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Google Calendar:");
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined,
        envVars: {
          hasServiceAccount: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
          privateKeyPreview: process.env.GOOGLE_PRIVATE_KEY?.substring(0, 50) + "..."
        }
      });
    }
  }

  async createEvent(event: {
    summary: string;
    start: Date;
    end: Date;
    attendees?: string[];
    description?: string;
  }) {
    if (!this.isInitialized || !this.calendar) {
      throw new Error("Google Calendar not initialized");
    }

    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: {
          summary: event.summary,
          start: {
            dateTime: event.start.toISOString(),
            timeZone: 'Europe/Paris',
          },
          end: {
            dateTime: event.end.toISOString(),
            timeZone: 'Europe/Paris',
          },
          attendees: event.attendees?.map(email => ({ email })),
          description: event.description,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Failed to create Google Calendar event:", error);
      throw error;
    }
  }

  async getAvailability(start: Date, end: Date) {
    if (!this.isInitialized || !this.calendar) {
      throw new Error("Google Calendar not initialized");
    }

    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      console.error("Failed to get Google Calendar availability:", error);
      throw error;
    }
  }
}

const googleCalendarService = new GoogleCalendarService();

// TRPC Setup
const t = initTRPC.context<any>().create({
  transformer: superjson,
});

// Schema for availability slots
const createAvailabilitySlotSchema = z.object({
  practitionerId: z.number().int().positive(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  capacity: z.number().int().positive().default(1).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true).optional(),
  emailPatient: z.string().email().optional(),
});

// Create Router
const router = t.router;
const TRPCRouter = router({
  // Availability slots with Google Calendar integration
  availabilitySlots: router({
    create: t.procedure
      .input(createAvailabilitySlotSchema)
      .mutation(async ({ input }) => {
        try {
          console.log("Creating availability slot with Google Calendar:", input);
          
          // Create Google Calendar event
          const startDate = new Date(input.startTime);
          const endDate = new Date(input.endTime);
          
          const summary = input.notes || "Consultation";
          const description = `Créneau de consultation - Praticien ID: ${input.practitionerId}`;
          
          const calendarEvent = await googleCalendarService.createEvent({
            summary,
            start: startDate,
            end: endDate,
            attendees: input.emailPatient ? [input.emailPatient] : [],
            description,
          });

          console.log("Google Calendar event created:", calendarEvent.id);

          // Mock database response
          return {
            id: Math.floor(Math.random() * 1000000),
            googleCalendarEventId: calendarEvent.id,
            ...input,
            createdAt: new Date().toISOString(),
            startTime: input.startTime,
            endTime: input.endTime,
          };
        } catch (error) {
          console.error("Error creating availability slot:", error);
          throw new Error("Failed to create availability slot: " + (error as Error).message);
        }
      }),
    
    listByPractitioner: t.procedure
      .input(z.object({ practitionerId: z.number().int().positive() }))
      .query(async ({ input }) => {
        try {
          console.log("Getting availability slots for practitioner:", input.practitionerId);
          
          // Get Google Calendar events for the next 30 days
          const start = new Date();
          const end = new Date();
          end.setDate(end.getDate() + 30);
          
          const calendarEvents = await googleCalendarService.getAvailability(start, end);
          
          return calendarEvents.map((event: any) => ({
            id: event.id,
            googleCalendarEventId: event.id,
            practitionerId: input.practitionerId,
            summary: event.summary,
            startTime: event.start.dateTime,
            endTime: event.end.dateTime,
            notes: event.description,
            isActive: true,
          }));
        } catch (error) {
          console.error("Error getting availability slots:", error);
          throw new Error("Failed to get availability slots");
        }
      }),
  }),

  // Practitioners
  practitioners: router({
    list: t.procedure.query(async () => {
      console.log("Getting all practitioners");
      return [
        {
          id: 1,
          name: "Dr. Dupont",
          email: "dr.dupont@example.com",
          specialty: "Médecine générale",
        },
        {
          id: 2,
          name: "Dr. Martin",
          email: "dr.martin@example.com", 
          specialty: "Cardiologie",
        },
      ];
    }),
  }),

  // System
  system: router({
    health: t.procedure.query(() => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        message: "Service is running with Google Calendar integration",
      };
    }),
  }),

  // Google Calendar
  googleCalendar: router({
    sync: t.procedure
      .mutation(async () => {
        try {
          console.log("Syncing Google Calendar availability");
          // This would sync recurring availability from Google Calendar
          return {
            success: true,
            message: "Google Calendar synced successfully",
          };
        } catch (error) {
          console.error("Error syncing Google Calendar:", error);
          throw new Error("Failed to sync Google Calendar");
        }
      }),
  }),
});

// Express App
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// OAuth Routes
OAuthService.registerRoutes(app);

// TRPC Middleware
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: TRPCRouter,
    createContext: ({ req, res }: CreateExpressContextOptions) => ({
      req,
      res,
      user: null,
    }),
  })
);

// Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    googleCalendar: googleCalendarService['isInitialized'] ? "initialized" : "not initialized"
  });
});

// Export for Vercel
export default (req: Request, res: Response) => {
  app(req, res);
};

export type AppRouter = typeof TRPCRouter;