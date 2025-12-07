import { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";
import ical from 'node-ical';
import { google } from 'googleapis';

const t = initTRPC.context<any>().create({
  transformer: superjson,
});

const router = t.router;
const publicProcedure = t.procedure;

function cleanDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  
  let cleanUrl = url.trim();
  
  if (cleanUrl.startsWith("psql ")) {
    cleanUrl = cleanUrl.replace(/^psql\s+/, '');
  }
  
  cleanUrl = cleanUrl.replace(/^['"]/, '').replace(/['"]$/, '');
  
  if (!cleanUrl.startsWith('postgresql://') && !cleanUrl.startsWith('postgres://')) {
    console.error('[Vercel TRPC] DATABASE_URL invalide:', cleanUrl.substring(0, 30) + '...');
    return undefined;
  }
  
  return cleanUrl;
}

interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  title: string;
}

async function getAvailableSlotsFromIcal(startDate?: Date, endDate?: Date): Promise<AvailableSlot[]> {
  const icalUrl = process.env.GOOGLE_CALENDAR_ICAL_URL;
  
  if (!icalUrl) {
    console.warn('[Vercel TRPC] GOOGLE_CALENDAR_ICAL_URL non configure');
    return [];
  }

  try {
    console.log('[Vercel TRPC] Recuperation des disponibilites depuis iCal URL...');
    
    const now = new Date();
    const filterStartDate = startDate || now;
    const filterEndDate = endDate || new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const slots: AvailableSlot[] = [];

    const events = await ical.async.fromURL(icalUrl);
    console.log('[Vercel TRPC] Evenements total dans iCal:', Object.keys(events).length);
    
    Object.values(events).forEach((event: any) => {
      if (event.type !== 'VEVENT') return;

      const title = event.summary?.toLowerCase() || '';
      
      const isAvailable = 
        title.includes('disponible') || 
        title.includes('available') || 
        title.includes('dispo') ||
        title.includes('libre') ||
        title.includes('free');

      if (!isAvailable) return;

      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      if (eventStart < filterStartDate || eventStart > filterEndDate) return;
      if (eventStart < now) return;

      const duration = Math.round((eventEnd.getTime() - eventStart.getTime()) / (1000 * 60));

      const dateStr = eventStart.toISOString().split('T')[0];
      const startTime = eventStart.toTimeString().slice(0, 5);
      const endTime = eventEnd.toTimeString().slice(0, 5);

      console.log('[Vercel TRPC] Creneau disponible ajoute:', dateStr, startTime, '-', endTime);
      slots.push({
        date: dateStr,
        startTime,
        endTime,
        duration,
        title: event.summary || 'Disponible',
      });
    });

    console.log(`[Vercel TRPC] ${slots.length} creneaux disponibles trouves`);
    
    slots.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

    return slots;
  } catch (error) {
    console.error('[Vercel TRPC] Erreur lors de la recuperation des disponibilites:', error);
    return [];
  }
}

async function getBookedSlots(databaseUrl: string | undefined): Promise<Set<string>> {
  const bookedSlots = new Set<string>();
  
  const cleanUrl = cleanDatabaseUrl(databaseUrl);
  if (!cleanUrl) {
    return bookedSlots;
  }

  try {
    const sql = neon(cleanUrl);
    const result = await sql`
      SELECT "startTime", "endTime" 
      FROM appointments 
      WHERE status IN ('confirmed', 'pending')
    `;
    
    for (const apt of result) {
      const aptStart = new Date(apt.startTime);
      const dateStr = aptStart.toISOString().split('T')[0];
      const timeStr = aptStart.toTimeString().slice(0, 5);
      bookedSlots.add(`${dateStr}|${timeStr}`);
    }
  } catch (error) {
    console.error("[Vercel TRPC] Erreur lecture rendez-vous:", error);
  }
  
  return bookedSlots;
}

async function createGoogleCalendarEvent(appointmentData: {
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  date: Date;
  startTime: string;
  endTime: string;
  reason?: string;
}): Promise<string | null> {
  const privateKey = process.env.GOOGLE_CALENDAR_PRIVATE_KEY;
  const serviceAccountEmail = process.env.GOOGLE_CALENDAR_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const targetCalendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!privateKey || !serviceAccountEmail) {
    console.warn('[Vercel TRPC] Configuration Google Calendar incomplete pour creation evenement');
    return null;
  }

  try {
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const startDateTime = new Date(appointmentData.date);
    const [startHours, startMinutes] = appointmentData.startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(appointmentData.date);
    const [endHours, endMinutes] = appointmentData.endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    const event = {
      summary: `RDV - ${appointmentData.patientName}`,
      description: `Patient: ${appointmentData.patientName}\nEmail: ${appointmentData.patientEmail}\nTelephone: ${appointmentData.patientPhone || 'Non renseigne'}\nMotif: ${appointmentData.reason || 'Non precise'}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      colorId: '9',
      attendees: [
        { email: appointmentData.patientEmail }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: targetCalendarId || serviceAccountEmail,
      resource: event,
      sendUpdates: 'all',
    });

    console.log('[Vercel TRPC] Evenement Google Calendar cree:', response.data.id);
    return response.data.id || null;
  } catch (error) {
    console.error('[Vercel TRPC] Erreur creation evenement Google Calendar:', error);
    return null;
  }
}

const appRouter = router({
  booking: router({
    getAvailabilitiesByDate: publicProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          console.log("[Vercel TRPC] getAvailabilitiesByDate appele avec:", input);
          
          const startDate = input.startDate ? new Date(input.startDate) : new Date();
          const endDate = input.endDate ? new Date(input.endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
          
          const bookedSlots = await getBookedSlots(process.env.DATABASE_URL);
          const icalSlots = await getAvailableSlotsFromIcal(startDate, endDate);
          
          const slotsByDate: Record<string, any[]> = {};
          
          for (const slot of icalSlots) {
            const slotKey = `${slot.date}|${slot.startTime}`;
            
            if (!bookedSlots.has(slotKey)) {
              if (!slotsByDate[slot.date]) {
                slotsByDate[slot.date] = [];
              }
              slotsByDate[slot.date].push(slot);
            }
          }
          
          for (const date of Object.keys(slotsByDate)) {
            slotsByDate[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
          }
          
          const availableDates = Object.keys(slotsByDate).sort();
          console.log(`[Vercel TRPC] ${availableDates.length} dates disponibles depuis iCal`);
          
          return {
            success: true,
            slotsByDate,
            availableDates,
          };
        } catch (error: any) {
          console.error("[Vercel TRPC] Erreur getAvailabilitiesByDate:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Impossible de recuperer les disponibilites: " + error.message
          });
        }
      }),

    getAvailabilities: publicProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const startDate = input.startDate ? new Date(input.startDate) : new Date();
        const endDate = input.endDate ? new Date(input.endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
        
        const slots = await getAvailableSlotsFromIcal(startDate, endDate);
        
        return { success: true, slots };
      }),

    bookAppointment: publicProcedure
      .input(z.object({
        date: z.string(),
        time: z.string(),
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
          console.log("[Vercel TRPC] bookAppointment:", input);
          
          const appointmentDate = new Date(input.date);
          const [hours, minutes] = input.time.split(':').map(Number);
          appointmentDate.setHours(hours, minutes, 0, 0);
          
          const endDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000);
          const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
          
          const cancellationHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          
          const googleEventId = await createGoogleCalendarEvent({
            patientName: `${input.patientInfo.firstName} ${input.patientInfo.lastName}`,
            patientEmail: input.patientInfo.email,
            patientPhone: input.patientInfo.phone,
            date: appointmentDate,
            startTime: input.time,
            endTime: endTime,
            reason: input.patientInfo.reason,
          });
          
          const dbUrl = cleanDatabaseUrl(process.env.DATABASE_URL);
          if (dbUrl) {
            const sql = neon(dbUrl);
            
            await sql`
              INSERT INTO appointments 
              ("practitionerId", "serviceId", "startTime", "endTime", status, "customerName", "customerEmail", "customerPhone", notes, "cancellationHash", "googleEventId", "createdAt", "updatedAt")
              VALUES 
              (1, 1, ${appointmentDate.toISOString()}, ${endDate.toISOString()}, 'confirmed', ${`${input.patientInfo.firstName} ${input.patientInfo.lastName}`}, ${input.patientInfo.email}, ${input.patientInfo.phone}, ${input.patientInfo.reason || null}, ${cancellationHash}, ${googleEventId || null}, NOW(), NOW())
            `;
          }
          
          return {
            success: true,
            appointmentHash: cancellationHash,
            googleEventId,
            message: "Rendez-vous confirme avec succes",
            confirmation: {
              date: input.date,
              time: input.time,
              endTime,
              practitioner: "Dorian Sarry",
              patient: `${input.patientInfo.firstName} ${input.patientInfo.lastName}`
            }
          };
        } catch (error: any) {
          console.error("[Vercel TRPC] Erreur booking:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de la reservation: " + error.message
          });
        }
      }),
  }),

  patientAppointments: router({
    getByEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        try {
          const dbUrl = cleanDatabaseUrl(process.env.DATABASE_URL);
          if (!dbUrl) {
            return { success: false, appointments: [], total: 0, error: "Database not configured" };
          }
          
          const sql = neon(dbUrl);
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
          const dbUrl = cleanDatabaseUrl(process.env.DATABASE_URL);
          if (!dbUrl) {
            throw new Error("Database not configured");
          }
          
          const sql = neon(dbUrl);
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

async function getRequestBody(req: VercelRequest): Promise<string> {
  if (req.body) {
    return typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }
  
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url || '', `${protocol}://${host}`);
    
    let body: string | undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await getRequestBody(req);
    }
    
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      }
    }
    
    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body: body,
    });
    
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext: () => ({}),
    });
    
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    const responseBody = await response.text();
    res.send(responseBody);
  } catch (error: any) {
    console.error("[Vercel TRPC] Handler error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
}
