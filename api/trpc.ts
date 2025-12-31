import { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

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

/**
 * Crée et configure le client OAuth2 pour Google Calendar
 */
function createOAuth2Client(): OAuth2Client | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('[Vercel TRPC OAuth2] ❌ Configuration OAuth incomplète. Variables requises:');
    console.error('  - GOOGLE_CLIENT_ID:', clientId ? '✅' : '❌');
    console.error('  - GOOGLE_CLIENT_SECRET:', clientSecret ? '✅' : '❌');
    console.error('  - GOOGLE_REFRESH_TOKEN:', refreshToken ? '✅' : '❌');
    return null;
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://localhost' // Redirect URI (non utilisé avec refresh token)
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    console.log('[Vercel TRPC OAuth2] ✅ Client OAuth2 initialisé avec succès');
    return oauth2Client;
  } catch (error: any) {
    console.error('[Vercel TRPC OAuth2] ❌ Erreur lors de la création du client:', error.message);
    return null;
  }
}

/**
 * Récupérer les événements depuis Google Calendar via OAuth2
 */
async function getEventsFromGoogleCalendar(startDate: Date, endDate: Date): Promise<any[]> {
  const oauth2Client = createOAuth2Client();
  
  if (!oauth2Client) {
    console.error('[Vercel TRPC] ❌ Impossible de créer le client OAuth2');
    return [];
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    console.log('[Vercel TRPC OAuth2] 📅 Récupération des événements Google Calendar...');
    console.log('[Vercel TRPC OAuth2] 📆 Période:', {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    });

    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      timeZone: 'Europe/Paris',
      showDeleted: false,
      maxResults: 2500,
    });

    const events = response.data.items || [];
    console.log(`[Vercel TRPC OAuth2] ✅ ${events.length} événements récupérés`);

    return events;
  } catch (error: any) {
    console.error('[Vercel TRPC OAuth2] ❌ Erreur lors de la récupération des événements:', error.message);
    return [];
  }
}

/**
 * Génère les créneaux disponibles basés sur les horaires de travail et les événements existants
 */
async function getAvailableSlotsFromOAuth(startDate?: Date, endDate?: Date, databaseUrl?: string): Promise<AvailableSlot[]> {
  console.log('[Vercel TRPC OAuth2] 📅 Récupération des disponibilités via OAuth2 (Refresh Token)');
  
  const now = new Date();
  const filterStartDate = startDate || now;
  const filterEndDate = endDate || new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  console.log('[Vercel TRPC OAuth2] 🌍 Environnement:', {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    serverTime: now.toISOString(),
  });

  // Récupérer les événements existants depuis Google Calendar
  const events = await getEventsFromGoogleCalendar(filterStartDate, filterEndDate);
  
  if (events.length === 0) {
    console.warn('[Vercel TRPC OAuth2] ⚠️ Aucun événement récupéré depuis Google Calendar');
  }

  // Récupérer les rendez-vous de la base de données
  const bookedFromDb = await getBookedSlots(databaseUrl);
  console.log(`[Vercel TRPC OAuth2] 💾 ${bookedFromDb.size} rendez-vous en BD`);

  // Horaires de travail (configuration)
  const workingHours = {
    startHour: 9,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
    slotDuration: 60, // minutes
    workingDays: [1, 2, 3, 4, 5], // Lundi à Vendredi (ISO 8601)
  };

  const slots: AvailableSlot[] = [];
  
  // Générer les créneaux pour chaque jour de la période
  let currentDate = new Date(filterStartDate);
  currentDate.setHours(0, 0, 0, 0);

  while (currentDate <= filterEndDate) {
    const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay(); // Dimanche = 7
    
    // Vérifier si c'est un jour ouvrable
    if (workingHours.workingDays.includes(dayOfWeek)) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Générer les créneaux pour ce jour
      for (let hour = workingHours.startHour; hour < workingHours.endHour; hour++) {
        const slotStart = new Date(currentDate);
        slotStart.setHours(hour, workingHours.startMinute, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + workingHours.slotDuration);

        // Ignorer les créneaux passés
        if (slotStart < now) {
          continue;
        }

        const startTime = slotStart.toTimeString().slice(0, 5);
        const endTime = slotEnd.toTimeString().slice(0, 5);
        const slotKey = `${dateStr}|${startTime}`;

        // Vérifier que le créneau n'est pas déjà réservé en BD
        if (bookedFromDb.has(slotKey)) {
          console.log('[Vercel TRPC OAuth2] ❌ Créneau filtré (réservé en BD):', slotKey);
          continue;
        }

        // Vérifier qu'aucun événement Google Calendar ne chevauche ce créneau
        let isAvailable = true;
        for (const event of events) {
          if (!event.start?.dateTime || !event.end?.dateTime) continue;

          const eventStart = new Date(event.start.dateTime);
          const eventEnd = new Date(event.end.dateTime);

          // Détection de chevauchement
          if (slotStart < eventEnd && slotEnd > eventStart) {
            isAvailable = false;
            console.log('[Vercel TRPC OAuth2] ❌ Créneau filtré (chevauchement avec événement):', slotKey, '-', event.summary);
            break;
          }
        }

        if (isAvailable) {
          slots.push({
            date: dateStr,
            startTime,
            endTime,
            duration: workingHours.slotDuration,
            title: 'Disponible (60 min)',
          });
        }
      }
    }
    
    // Passer au jour suivant
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`[Vercel TRPC OAuth2] 🎯 RÉSULTAT: ${slots.length} créneaux disponibles`);
  
  if (slots.length > 0) {
    console.log('[Vercel TRPC OAuth2] 📊 Exemples de créneaux:', slots.slice(0, 5).map(s => 
      `${s.date} ${s.startTime}-${s.endTime}`
    ));
  } else {
    console.warn('[Vercel TRPC OAuth2] ⚠️ AUCUN créneau disponible - Vérifier la configuration');
  }

  return slots;
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
  const oauth2Client = createOAuth2Client();
  
  if (!oauth2Client) {
    console.error('[Vercel TRPC OAuth2] ❌ Impossible de créer un événement sans OAuth2');
    return null;
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const targetCalendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    const startDateTime = new Date(appointmentData.date);
    const [startHours, startMinutes] = appointmentData.startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(appointmentData.date);
    const [endHours, endMinutes] = appointmentData.endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    const event = {
      summary: `🗓️ RDV - ${appointmentData.patientName}`,
      description: `Patient: ${appointmentData.patientName}\nEmail: ${appointmentData.patientEmail}\nTéléphone: ${appointmentData.patientPhone || 'Non renseigné'}\nMotif: ${appointmentData.reason || 'Non précisé'}\n\n✅ Réservé via l'application web`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      colorId: '11',
      transparency: 'opaque',
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: targetCalendarId,
      requestBody: event,
      sendUpdates: 'none',
    });

    console.log('[Vercel TRPC OAuth2] ✅ Événement Google Calendar créé:', response.data.id);
    return response.data.id || null;
  } catch (error: any) {
    console.error('[Vercel TRPC OAuth2] ❌ Erreur création événement:', error.message);
    return null;
  }
}

async function deleteGoogleCalendarEvent(eventId: string): Promise<boolean> {
  const oauth2Client = createOAuth2Client();
  
  if (!oauth2Client) {
    console.error('[Vercel TRPC OAuth2] ❌ Impossible de supprimer un événement sans OAuth2');
    return false;
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const targetCalendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    await calendar.events.delete({
      calendarId: targetCalendarId,
      eventId: eventId,
      sendUpdates: 'none',
    });

    console.log('[Vercel TRPC OAuth2] ✅ Événement Google Calendar supprimé:', eventId);
    return true;
  } catch (error: any) {
    console.error('[Vercel TRPC OAuth2] ❌ Erreur suppression événement:', error.message);
    return false;
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
          console.log("[Vercel TRPC OAuth2] getAvailabilitiesByDate appelé avec:", input);
          
          const startDate = input.startDate ? new Date(input.startDate) : new Date();
          const endDate = input.endDate ? new Date(input.endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
          
          // Utiliser OAuth2 avec refresh token au lieu d'iCal
          const slots = await getAvailableSlotsFromOAuth(startDate, endDate, process.env.DATABASE_URL);
          
          const slotsByDate: Record<string, any[]> = {};
          
          for (const slot of slots) {
            if (!slotsByDate[slot.date]) {
              slotsByDate[slot.date] = [];
            }
            slotsByDate[slot.date].push(slot);
          }
          
          for (const date of Object.keys(slotsByDate)) {
            slotsByDate[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
          }
          
          const availableDates = Object.keys(slotsByDate).sort();
          console.log(`[Vercel TRPC OAuth2] ✅ ${availableDates.length} dates disponibles via OAuth2`);
          
          return {
            success: true,
            slotsByDate,
            availableDates,
          };
        } catch (error: any) {
          console.error("[Vercel TRPC OAuth2] ❌ Erreur getAvailabilitiesByDate:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Impossible de récupérer les disponibilités: " + error.message
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
        
        // Utiliser OAuth2 avec refresh token
        const slots = await getAvailableSlotsFromOAuth(startDate, endDate, process.env.DATABASE_URL);
        
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
            
            const existingPractitioner = await sql`SELECT id FROM practitioners LIMIT 1`;
            let practitionerId: number;
            
            if (existingPractitioner.length === 0) {
              const newPractitioner = await sql`
                INSERT INTO practitioners ("name", "email", "phone", "specialty", "bio", "isActive", "createdAt", "updatedAt")
                VALUES ('Dorian Sarry', 'doriansarry47@gmail.com', '', 'Therapie Sensori-Motrice', 'Praticien certifie', true, NOW(), NOW())
                RETURNING id
              `;
              practitionerId = newPractitioner[0].id;
            } else {
              practitionerId = existingPractitioner[0].id;
            }
            
            const existingService = await sql`SELECT id FROM services LIMIT 1`;
            let serviceId: number;
            
            if (existingService.length === 0) {
              const newService = await sql`
                INSERT INTO services ("name", "description", "duration", "price", "isActive", "createdAt", "updatedAt")
                VALUES ('Consultation', 'Seance de therapie sensori-motrice', 60, 0, true, NOW(), NOW())
                RETURNING id
              `;
              serviceId = newService[0].id;
            } else {
              serviceId = existingService[0].id;
            }
            
            await sql`
              INSERT INTO appointments 
              ("practitionerId", "serviceId", "startTime", "endTime", status, "customerName", "customerEmail", "customerPhone", notes, "cancellationHash", "googleEventId", "createdAt", "updatedAt")
              VALUES 
              (${practitionerId}, ${serviceId}, ${appointmentDate.toISOString()}, ${endDate.toISOString()}, 'confirmed', ${`${input.patientInfo.firstName} ${input.patientInfo.lastName}`}, ${input.patientInfo.email}, ${input.patientInfo.phone}, ${input.patientInfo.reason || null}, ${cancellationHash}, ${googleEventId || null}, NOW(), NOW())
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
          
          // Récupérer l'événement Google Calendar ID avant annulation
          const appointment = await sql`
            SELECT "googleEventId" FROM appointments 
            WHERE "cancellationHash" = ${input.hash}
          `;
          
          // Supprimer l'événement Google Calendar si présent
          if (appointment.length > 0 && appointment[0].googleEventId) {
            await deleteGoogleCalendarEvent(appointment[0].googleEventId);
          }
          
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
