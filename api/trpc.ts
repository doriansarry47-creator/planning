import "dotenv/config";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { google } from "googleapis";
import { Resend } from "resend";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY);

const t = initTRPC.context<any>().create({
  transformer: superjson,
});

const router = t.router;
const publicProcedure = t.procedure;

class GoogleCalendarJWTClient {
  private calendar: any;
  private auth: any;
  public isInitialized = false;
  private calendarId: string;

  constructor() {
    this.calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    this.initializeCalendar();
  }

  private async initializeCalendar() {
    try {
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "";
      let serviceAccountPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "";

      if (!serviceAccountEmail || !serviceAccountPrivateKey) {
        console.warn("[Vercel] Google Calendar credentials manquants");
        this.isInitialized = false;
        return;
      }

      serviceAccountPrivateKey = serviceAccountPrivateKey
        .trim()
        .replace(/^"|"$/g, '')
        .replace(/\\n/g, '\n')
        .replace(/\\\\n/g, '\n');

      this.auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: serviceAccountPrivateKey,
        scopes: ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar.events'],
      });

      await this.auth.authorize();
      this.calendar = google.calendar({ version: 'v3', auth: this.auth });
      this.isInitialized = true;
      console.log("[Vercel] Google Calendar initialisé");
    } catch (error) {
      console.error("[Vercel] Erreur Google Calendar:", error);
      this.isInitialized = false;
    }
  }

  getDefaultSlots(date: Date): Array<{date: string, startTime: string, endTime: string, duration: number, title: string}> {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return [];

    const dateStr = date.toISOString().split('T')[0];
    const slots = [
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '10:00', endTime: '11:00' },
      { startTime: '11:00', endTime: '12:00' },
      { startTime: '14:00', endTime: '15:00' },
      { startTime: '15:00', endTime: '16:00' },
      { startTime: '16:00', endTime: '17:00' },
      { startTime: '17:00', endTime: '18:00' },
    ];

    return slots.map(slot => ({
      date: dateStr,
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: 60,
      title: "Disponible (60 min)"
    }));
  }

  async getAvailableSlots(startDate: Date, endDate: Date): Promise<Array<{date: string, startTime: string, endTime: string, duration: number, title: string}>> {
    const allSlots: Array<{date: string, startTime: string, endTime: string, duration: number, title: string}> = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const slots = this.getDefaultSlots(new Date(currentDate));
      allSlots.push(...slots);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return allSlots;
  }
}

const googleCalendarClient = new GoogleCalendarJWTClient();

const appRouter = router({
  booking: router({
    getAvailableSlotsGroupedByDate: publicProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        duration: z.number().optional().default(60),
      }))
      .query(async ({ input }) => {
        try {
          const start = input.startDate ? new Date(input.startDate) : new Date();
          const end = input.endDate ? new Date(input.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          const slots = await googleCalendarClient.getAvailableSlots(start, end);

          const slotsByDate: Record<string, typeof slots> = {};
          for (const slot of slots) {
            if (!slotsByDate[slot.date]) {
              slotsByDate[slot.date] = [];
            }
            slotsByDate[slot.date].push(slot);
          }

          return {
            success: true,
            slotsByDate,
            totalSlots: slots.length,
            dateCount: Object.keys(slotsByDate).length
          };
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Impossible de récupérer les disponibilités: " + error.message
          });
        }
      }),

    bookAppointment: publicProcedure
      .input(z.object({
        date: z.string(),
        startTime: z.string(),
        duration: z.number().default(60),
        patientInfo: z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().min(1),
          reason: z.string().optional(),
        })
      }))
      .mutation(async ({ input }) => {
        try {
          const appointmentDate = new Date(input.date);
          const [hours, minutes] = input.startTime.split(':').map(Number);
          appointmentDate.setHours(hours, minutes, 0, 0);

          const endDate = new Date(appointmentDate.getTime() + input.duration * 60 * 1000);
          const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

          const cancellationHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

          if (process.env.DATABASE_URL) {
            const sql = neon(process.env.DATABASE_URL);
            const db = drizzle(sql);

            await db.execute(`
              INSERT INTO appointments 
              ("practitionerId", "serviceId", "startTime", "endTime", status, "customerName", "customerEmail", "customerPhone", notes, "cancellationHash", "createdAt", "updatedAt")
              VALUES 
              (1, 1, $1, $2, 'confirmed', $3, $4, $5, $6, $7, NOW(), NOW())
            `, [
              appointmentDate.toISOString(),
              endDate.toISOString(),
              `${input.patientInfo.firstName} ${input.patientInfo.lastName}`,
              input.patientInfo.email,
              input.patientInfo.phone,
              input.patientInfo.reason || null,
              cancellationHash
            ]);
          }

          if (process.env.RESEND_API_KEY) {
            try {
              await resend.emails.send({
                from: 'Dorian Sarry <noreply@dorian-sarry.com>',
                to: input.patientInfo.email,
                subject: 'Confirmation de votre rendez-vous',
                html: `
                  <h2>Confirmation de rendez-vous</h2>
                  <p>Bonjour ${input.patientInfo.firstName},</p>
                  <p>Votre rendez-vous a bien ete confirme.</p>
                  <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Date:</strong> ${appointmentDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><strong>Heure:</strong> ${input.startTime} - ${endTime}</p>
                    <p><strong>Duree:</strong> ${input.duration} minutes</p>
                    <p><strong>Praticien:</strong> Dorian Sarry</p>
                  </div>
                  <p>Cordialement,<br>Dorian Sarry</p>
                `
              });
            } catch (emailError) {
              console.error("[Vercel] Erreur envoi email:", emailError);
            }
          }

          return {
            success: true,
            appointmentId: cancellationHash,
            message: "Rendez-vous confirme avec succes",
            confirmation: {
              date: input.date,
              time: input.startTime,
              endTime,
              duration: input.duration,
              practitioner: "Dorian Sarry",
              patient: `${input.patientInfo.firstName} ${input.patientInfo.lastName}`
            }
          };
        } catch (error: any) {
          console.error("[Vercel] Erreur booking:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de la reservation: " + error.message
          });
        }
      }),

    healthCheck: publicProcedure.query(() => ({
      status: "ok",
      timestamp: new Date().toISOString(),
      platform: "vercel",
      calendarInitialized: googleCalendarClient.isInitialized
    }))
  }),

  patientAppointments: router({
    getByEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        try {
          if (!process.env.DATABASE_URL) {
            return { success: false, appointments: [], total: 0, error: "Database not configured" };
          }

          const sql = neon(process.env.DATABASE_URL);
          const result = await sql`
            SELECT * FROM appointments 
            WHERE "customerEmail" = ${input.email}
            ORDER BY "startTime" DESC
          `;

          return {
            success: true,
            appointments: result.map((apt: any) => ({
              id: apt.id,
              date: new Date(apt.startTime).toLocaleDateString('fr-FR'),
              startTime: new Date(apt.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              endTime: new Date(apt.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              customerName: apt.customerName,
              customerEmail: apt.customerEmail,
              customerPhone: apt.customerPhone,
              status: apt.status,
              notes: apt.notes,
              cancellationHash: apt.cancellationHash,
            })),
            total: result.length
          };
        } catch (error: any) {
          return { success: false, appointments: [], total: 0, error: error.message };
        }
      }),

    cancelByHash: publicProcedure
      .input(z.object({ hash: z.string() }))
      .mutation(async ({ input }) => {
        try {
          if (!process.env.DATABASE_URL) {
            throw new Error("Database not configured");
          }

          const sql = neon(process.env.DATABASE_URL);
          await sql`
            UPDATE appointments 
            SET status = 'cancelled', "updatedAt" = NOW()
            WHERE "cancellationHash" = ${input.hash}
          `;

          return { success: true, message: "Rendez-vous annule" };
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de l'annulation: " + error.message
          });
        }
      })
  }),

  system: router({
    health: publicProcedure
      .input(z.object({ timestamp: z.number().min(0) }))
      .query(() => ({ ok: true }))
  })
});

export type AppRouter = typeof appRouter;

export default async function handler(request: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => ({}),
  });
}

export const config = {
  runtime: "edge",
};
