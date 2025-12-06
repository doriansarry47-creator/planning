import "dotenv/config";
import express, { Request, Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import superjson from "superjson";
import { TRPCError, initTRPC } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { z } from "zod";
import { google } from "googleapis";
import { Resend } from "resend";

// Service d'email
const resend = new Resend(process.env.RESEND_API_KEY || 're_Crbni8Gw_2Jb32KcyR4gLdkGs8umzGrHd');

// Service Google Calendar OAuth2
class OptimizedGoogleCalendarService {
  private calendar: any;
  private auth: any;
  private isInitialized = false;
  
  // Configuration OAuth2 pour doriansarry47@gmail.com
  public clientId = process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
  public clientSecret = process.env.GOOGLE_CLIENT_SECRET || "YOUR_GOOGLE_CLIENT_SECRET";
  public redirectUri = "https://planning-7qkb7uw7v-ikips-projects.vercel.app/api/oauth/callback";
  private calendarEmail = "doriansarry47@gmail.com";

  constructor() {
    this.initializeCalendar();
  }

  private async initializeCalendar() {
    try {
      console.log("🔑 Initialisation Google Calendar OAuth2 pour doriansarry47@gmail.com");
      
      // Initialiser OAuth2 client
      this.auth = new google.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUri);
      
      // Configuration pour calendrier de doriansarry47@gmail.com
      this.calendar = google.calendar({
        version: 'v3',
        auth: this.auth
      });
      
      // Tentative d'authentification avec le refresh token stocké
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
      if (!refreshToken) {
        console.log("⚠️ GOOGLE_REFRESH_TOKEN manquant - OAuth2 requis");
        this.isInitialized = false;
        return;
      }
      
      this.auth.setCredentials({
        refresh_token: refreshToken
      });
      
      // Générer un access token valide
      const { credentials } = await this.auth.refreshAccessToken();
      this.auth.setCredentials(credentials);
      
      console.log("✅ Google Calendar OAuth2 initialisé pour doriansarry47@gmail.com");
      this.isInitialized = true;
      
    } catch (error) {
      console.error("❌ Erreur initialisation Google Calendar OAuth2:", error);
      this.isInitialized = false;
    }
  }

  async getAvailableSlots(date: Date, durationMinutes: number = 60): Promise<string[]> {
    if (!this.isInitialized) {
      console.warn("⚠️ Google Calendar non initialisé - utilisation des créneaux par défaut");
      return this.getDefaultAvailableSlots(date);
    }

    try {
      // Définir la plage horaire (9h-17h)
      const dayStart = new Date(date);
      dayStart.setHours(9, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(17, 0, 0, 0);

      // Récupérer les événements existants pour ce jour
      const events = await this.calendar.events.list({
        calendarId: this.calendarEmail,
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      // Créer une liste de tous les créneaux possibles (9h-17h, toutes les heures)
      const allPossibleSlots = [];
      for (let hour = 9; hour < 17; hour++) {
        allPossibleSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      }

      // Filtrer les créneaux pris par des événements existants
      const busySlots = events.data.items?.map(event => {
        const startTime = event.start.dateTime || event.start.date;
        return new Date(startTime).getHours();
      }) || [];

      // Créneaux disponibles = tous les créneaux moins les créneaux occupés
      const availableSlots = allPossibleSlots.filter(slot => {
        const hour = parseInt(slot.split(':')[0]);
        return !busySlots.includes(hour);
      });

      console.log(`✅ Créneaux disponibles pour ${date.toDateString()}:`, availableSlots);
      return availableSlots;

    } catch (error) {
      console.error("❌ Erreur récupération créneaux disponibles:", error);
      return this.getDefaultAvailableSlots(date);
    }
  }

  private getDefaultAvailableSlots(date: Date): string[] {
    // Créneaux par défaut si impossible de récupérer depuis Google Calendar
    const slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    
    // Exclure week-ends
    if (date.getDay() === 0 || date.getDay() === 6) {
      return [];
    }
    
    return slots;
  }

  async createAppointment(appointment: {
    date: Date;
    time: string;
    patientInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      reason?: string;
    };
  }): Promise<any> {
    if (!this.isInitialized) {
      throw new Error("Service Google Calendar non disponible");
    }

    try {
      // Créer date de début
      const startDate = new Date(appointment.date);
      const [hour, minute] = appointment.time.split(':').map(Number);
      startDate.setHours(hour, minute, 0, 0);

      // Créer date de fin (60 minutes)
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 60);

      // Événement Google Calendar
      const event = {
        summary: `Consultation avec ${appointment.patientInfo.firstName} ${appointment.patientInfo.lastName}`,
        description: `Motif: ${appointment.patientInfo.reason || 'Consultation'}\\nTéléphone: ${appointment.patientInfo.phone}\\nEmail: ${appointment.patientInfo.email}`,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'Europe/Paris',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'Europe/Paris',
        },
        attendees: [
          { email: appointment.patientInfo.email }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // Rappel 24h avant
            { method: 'popup', minutes: 30 }, // Rappel 30min avant
          ],
        },
      };

      // Créer l'événement
      const createdEvent = await this.calendar.events.insert({
        calendarId: this.calendarEmail,
        resource: event,
        sendUpdates: 'all' // Envoyer notifications
      });

      console.log("✅ Événement créé dans Google Calendar:", createdEvent.data.id);

      // Envoyer email de confirmation
      await this.sendConfirmationEmail({
        to: appointment.patientInfo.email,
        patientName: `${appointment.patientInfo.firstName} ${appointment.patientInfo.lastName}`,
        appointmentDate: startDate,
        appointmentTime: appointment.time,
        eventId: createdEvent.data.id
      });

      return createdEvent.data;

    } catch (error) {
      console.error("❌ Erreur création appointment:", error);
      throw new Error("Impossible de créer le rendez-vous: " + (error as Error).message);
    }
  }

  private async sendConfirmationEmail(emailData: {
    to: string;
    patientName: string;
    appointmentDate: Date;
    appointmentTime: string;
    eventId: string;
  }) {
    try {
      const formattedDate = emailData.appointmentDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      await resend.emails.send({
        from: 'Dorian Sarry <noreply@dorian-sarry.com>',
        to: emailData.to,
        subject: 'Confirmation de votre rendez-vous',
        html: `
          <h2>Confirmation de rendez-vous</h2>
          <p>Bonjour ${emailData.patientName},</p>
          <p>Votre rendez-vous a été confirmé avec succès.</p>
          
          <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #1f2937; margin-top: 0;">Détails du rendez-vous</h3>
            <p><strong>Date :</strong> ${formattedDate}</p>
            <p><strong>Heure :</strong> ${emailData.appointmentTime}</p>
            <p><strong>Durée :</strong> 60 minutes</p>
            <p><strong>Praticien :</strong> Dorian Sarry</p>
          </div>
          
          <p>Vous recevrez un rappel 24h avant votre rendez-vous.</p>
          
          <p>Cordialement,<br>Dorian Sarry</p>
          
          <small style="color: #666;">Si vous souhaitez modifier ou annuler ce rendez-vous, contactez-nous au moins 24h à l'avance.</small>
        `
      });

      console.log("✅ Email de confirmation envoyé à:", emailData.to);
      
    } catch (error) {
      console.error("❌ Erreur envoi email confirmation:", error);
      // Ne pas faire échouer le processus si l'email échoue
    }
  }
}

const optimizedGoogleCalendarService = new OptimizedGoogleCalendarService();

// TRPC Setup
const t = initTRPC.context<any>().create({
  transformer: superjson,
});

// Schemas
const bookAppointmentSchema = z.object({
  date: z.string(),
  time: z.string(),
  patientInfo: z.object({
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(1, "Le téléphone est requis"),
    reason: z.string().optional(),
  })
});

const getAvailableSlotsSchema = z.object({
  date: z.string(),
});

// Create Router
const router = t.router;
const OptimizedTRPCRouter = router({
  // Booking - Patient only interface
  booking: router({
    getAvailableSlots: t.procedure
      .input(getAvailableSlotsSchema)
      .query(async ({ input }) => {
        try {
          const date = new Date(input.date);
          const availableSlots = await optimizedGoogleCalendarService.getAvailableSlots(date, 60);
          
          return {
            success: true,
            date: input.date,
            duration: 60,
            availableSlots,
            totalSlots: availableSlots.length
          };
          
        } catch (error) {
          console.error("❌ Erreur récupération créneaux:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Impossible de récupérer les créneaux disponibles"
          });
        }
      }),

    bookAppointment: t.procedure
      .input(bookAppointmentSchema)
      .mutation(async ({ input }) => {
        try {
          console.log("📅 Création appointment:", input);
          
          const appointmentDate = new Date(input.date);
          
          // Vérifier que le créneau est toujours disponible
          const availableSlots = await optimizedGoogleCalendarService.getAvailableSlots(appointmentDate, 60);
          if (!availableSlots.includes(input.time)) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Ce créneau n'est plus disponible"
            });
          }
          
          // Créer l'appointment
          const event = await optimizedGoogleCalendarService.createAppointment({
            date: appointmentDate,
            time: input.time,
            patientInfo: input.patientInfo
          });
          
          return {
            success: true,
            appointmentId: event.id,
            message: "Rendez-vous confirmé avec succès",
            event: event,
            confirmation: {
              date: appointmentDate,
              time: input.time,
              duration: 60,
              practitioner: "Dorian Sarry",
              patient: `${input.patientInfo.firstName} ${input.patientInfo.lastName}`
            }
          };
          
        } catch (error) {
          console.error("❌ Erreur booking appointment:", error);
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de la création du rendez-vous"
          });
        }
      }),

    // Health check for calendar service
    healthCheck: t.procedure
      .query(async () => {
        return {
          status: "ok",
          calendarInitialized: optimizedGoogleCalendarService['isInitialized'],
          timestamp: new Date().toISOString(),
          message: "Service optimisé de prise de rendez-vous",
          features: [
            "Intégration Google Calendar OAuth2",
            "Créneaux automatiques de 60 minutes",
            "Synchronisation temps réel",
            "Envoi automatique d'emails",
            "Interface patient optimisée"
          ]
        };
      })
  }),
});

// Express App
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// TRPC Middleware
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: OptimizedTRPCRouter,
    createContext: ({ req, res }: CreateExpressContextOptions) => ({
      req,
      res,
      user: null, // Patient interface only
    }),
  })
);

// OAuth2 Routes pour doriansarry47@gmail.com
app.get("/api/oauth/init", (req: Request, res: Response) => {
  try {
    const auth = new google.auth.OAuth2(
      optimizedGoogleCalendarService['clientId'],
      optimizedGoogleCalendarService['clientSecret'],
      optimizedGoogleCalendarService['redirectUri']
    );

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    const url = auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: 'calendar_auth'
    });

    console.log("🔑 URL d'autorisation OAuth2 générée");
    res.json({ 
      success: true, 
      authUrl: url,
      message: "Visitez cette URL pour autoriser l'accès à votre Google Calendar"
    });

  } catch (error) {
    console.error("❌ Erreur génération URL OAuth2:", error);
    res.status(500).json({ 
      error: "Erreur génération URL d'autorisation",
      details: (error as Error).message 
    });
  }
});

app.get("/api/oauth/callback", async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: "Code d'autorisation manquant" });
    }

    const auth = new google.auth.OAuth2(
      optimizedGoogleCalendarService['clientId'],
      optimizedGoogleCalendarService['clientSecret'],
      optimizedGoogleCalendarService['redirectUri']
    );

    // Échanger le code contre des tokens
    const { tokens } = await auth.getToken(code as string);
    
    console.log("✅ Tokens OAuth2 reçus:", {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiryDate: tokens.expiry_date
    });

    // Stocker le refresh token (en production, cette donnée devrait être chiffrée)
    const refreshToken = tokens.refresh_token;
    if (refreshToken) {
      console.log("🔑 Refresh Token reçu - À configurer en variable d'environnement");
      console.log("Var d'environnement à créer: GOOGLE_REFRESH_TOKEN=" + refreshToken);
      
      // Rediriger vers une page de succès avec les instructions
      res.redirect(`/success?refresh_token=${refreshToken}`);
    } else {
      res.status(500).json({ error: "Refresh token non reçu. Vérifiez les paramètres OAuth2." });
    }

  } catch (error) {
    console.error("❌ Erreur callback OAuth2:", error);
    res.status(500).json({ 
      error: "Erreur lors du callback OAuth2",
      details: (error as Error).message 
    });
  }
});

// Route pour définir le refresh token (pour développement)
app.post("/api/oauth/set-token", (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ error: "Refresh token manquant" });
    }

    // Mettre à jour les credentials
    optimizedGoogleCalendarService['auth'].setCredentials({
      refresh_token: refresh_token
    });

    console.log("🔑 Refresh token mis à jour dans le service");
    
    // Réinitialiser le service
    optimizedGoogleCalendarService['isInitialized'] = false;
    optimizedGoogleCalendarService['initializeCalendar']();

    res.json({ 
      success: true, 
      message: "Token configuré avec succès. Le service sera réinitialisé." 
    });

  } catch (error) {
    console.error("❌ Erreur configuration token:", error);
    res.status(500).json({ 
      error: "Erreur configuration token",
      details: (error as Error).message 
    });
  }
});

// Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    googleCalendar: optimizedGoogleCalendarService['isInitialized'] ? "initialized" : "not initialized",
    service: "Optimized Booking System",
    version: "2.0"
  });
});

// Export for Vercel
export default (req: Request, res: Response) => {
  app(req, res);
};

export type OptimizedAppRouter = typeof OptimizedTRPCRouter;