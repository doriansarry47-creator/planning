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

/**
 * Vérifie si un événement iCal est un créneau de disponibilité
 * RÈGLE : Un événement "DISPONIBLE" est une SOURCE de créneaux bookables
 */
function isDisponibilite(event: any): boolean {
  if (!event || !event.summary) return false;
  
  const title = event.summary.toLowerCase();
  
  return (
    title.includes('disponible') || 
    title.includes('available') || 
    title.includes('dispo') ||
    title.includes('libre') ||
    title.includes('free') ||
    title.includes('🟢')
  );
}

/**
 * Vérifie si un événement iCal est un rendez-vous (RDV) ou un blocage
 * RÈGLE : Un événement NON "DISPONIBLE" bloque le temps
 */
function isRendezVousOuBlocage(event: any): boolean {
  if (!event || !event.summary) return false;
  
  // Si c'est un créneau de disponibilité, ce n'est PAS un blocage
  if (isDisponibilite(event)) return false;
  
  const title = event.summary.toLowerCase();
  
  return (
    title.includes('réservé') || 
    title.includes('reserve') ||
    title.includes('consultation') ||
    title.includes('rdv') ||
    title.includes('rendez-vous') ||
    title.includes('🔴') ||
    title.includes('🩺') ||
    title.includes('indisponible') ||
    title.includes('unavailable')
  );
}

async function getAvailableSlotsFromIcal(startDate?: Date, endDate?: Date, databaseUrl?: string): Promise<AvailableSlot[]> {
  const icalUrl = process.env.GOOGLE_CALENDAR_ICAL_URL;
  
  if (!icalUrl) {
    console.error('[Vercel TRPC] ❌ GOOGLE_CALENDAR_ICAL_URL non configure');
    console.error('[Vercel TRPC] Variables env disponibles:', Object.keys(process.env).filter(k => k.includes('GOOGLE')));
    return [];
  }

  try {
    console.log('[Vercel TRPC] 📅 Recuperation des disponibilites depuis iCal URL...');
    console.log('[Vercel TRPC] 🌍 Environnement:', {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      serverTime: new Date().toISOString(),
    });
    console.log('[Vercel TRPC] 🔗 iCal URL (tronqué):', icalUrl.substring(0, 50) + '...');
    
    const now = new Date();
    const filterStartDate = startDate || now;
    const filterEndDate = endDate || new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    console.log('[Vercel TRPC] 📆 Période de recherche:', {
      start: filterStartDate.toISOString(),
      end: filterEndDate.toISOString(),
      now: now.toISOString(),
    });

    const slots: AvailableSlot[] = [];
    const bookedSlotsFromIcal: Set<string> = new Set();
    const disponibiliteEvents: any[] = [];

    const startFetch = Date.now();
    const events = await ical.async.fromURL(icalUrl);
    const fetchDuration = Date.now() - startFetch;
    
    console.log('[Vercel TRPC] ✅ Fetch iCal réussi en', fetchDuration, 'ms');
    console.log('[Vercel TRPC] 📋 Evenements total dans iCal:', Object.keys(events).length);
    
    // PREMIÈRE PASSE: Identifier les événements "DISPONIBLE" (SOURCE de créneaux)
    // et les événements bloquants (RDV, indisponibilités)
    let disponibiliteCount = 0;
    let blocageCount = 0;
    
    Object.values(events).forEach((event: any) => {
      if (event.type !== 'VEVENT') return;

      if (isDisponibilite(event)) {
        disponibiliteEvents.push(event);
        disponibiliteCount++;
        console.log('[Vercel TRPC] 🟢 DISPONIBILITÉ détectée:', event.summary);
      } else if (isRendezVousOuBlocage(event)) {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        const dateStr = eventStart.toISOString().split('T')[0];
        const startTime = eventStart.toTimeString().slice(0, 5);
        const endTime = eventEnd.toTimeString().slice(0, 5);
        
        const slotKey = `${dateStr}|${startTime}|${endTime}`;
        bookedSlotsFromIcal.add(slotKey);
        blocageCount++;
        console.log('[Vercel TRPC] 🔴 BLOCAGE détecté:', slotKey, '-', event.summary);
      }
    });
    
    console.log(`[Vercel TRPC] 📊 Analyse iCal: ${disponibiliteCount} disponibilités, ${blocageCount} blocages`);

    // Récupérer aussi les rendez-vous confirmés depuis la base de données
    const bookedFromDb = await getBookedSlots(databaseUrl);
    console.log(`[Vercel TRPC] 💾 Rendez-vous en BD: ${bookedFromDb.size}`);
    
    // DEUXIÈME PASSE: Générer les créneaux bookables à partir des événements "DISPONIBLE"
    for (const event of disponibiliteEvents) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      // Filtrer par date
      if (eventStart < filterStartDate || eventStart > filterEndDate) {
        console.log('[Vercel TRPC] ⏭️ Disponibilité hors période:', eventStart.toISOString());
        continue;
      }
      
      // Filtrer les créneaux passés
      if (eventStart < now) {
        console.log('[Vercel TRPC] ⏭️ Disponibilité passée:', eventStart.toISOString());
        continue;
      }

      const duration = Math.round((eventEnd.getTime() - eventStart.getTime()) / (1000 * 60));
      const dateStr = eventStart.toISOString().split('T')[0];
      const startTime = eventStart.toTimeString().slice(0, 5);
      const endTime = eventEnd.toTimeString().slice(0, 5);

      // Vérifier que ce créneau n'est pas déjà réservé
      const slotKey = `${dateStr}|${startTime}|${endTime}`;
      const slotKeySimple = `${dateStr}|${startTime}`;
      
      if (bookedSlotsFromIcal.has(slotKey)) {
        console.log('[Vercel TRPC] ❌ Créneau filtré (réservé dans iCal):', slotKey);
        continue;
      }
      
      if (bookedFromDb.has(slotKeySimple)) {
        console.log('[Vercel TRPC] ❌ Créneau filtré (réservé dans BD):', slotKeySimple);
        continue;
      }

      // Vérifier le chevauchement avec les créneaux réservés
      let isOverlapping = false;
      for (const bookedKey of bookedSlotsFromIcal) {
        const [bookedDate, bookedStart, bookedEnd] = bookedKey.split('|');
        if (bookedDate === dateStr) {
          const slotStartMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
          const slotEndMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
          const bookedStartMinutes = parseInt(bookedStart.split(':')[0]) * 60 + parseInt(bookedStart.split(':')[1]);
          const bookedEndMinutes = parseInt(bookedEnd.split(':')[0]) * 60 + parseInt(bookedEnd.split(':')[1]);
          
          if (slotStartMinutes < bookedEndMinutes && slotEndMinutes > bookedStartMinutes) {
            isOverlapping = true;
            console.log('[Vercel TRPC] ❌ Créneau filtré (chevauchement):', slotKey, 'avec', bookedKey);
            break;
          }
        }
      }

      if (isOverlapping) continue;

      console.log('[Vercel TRPC] ✅ Créneau DISPONIBLE ajouté:', dateStr, startTime, '-', endTime);
      slots.push({
        date: dateStr,
        startTime,
        endTime,
        duration,
        title: event.summary || 'Disponible',
      });
    }

    console.log(`[Vercel TRPC] 🎯 RÉSULTAT FINAL: ${slots.length} créneaux bookables trouvés`);
    
    if (slots.length > 0) {
      console.log('[Vercel TRPC] 📊 Exemples de créneaux bookables:', slots.slice(0, 5).map(s => 
        `${s.date} ${s.startTime}-${s.endTime} (${s.title})`
      ));
    } else {
      console.warn('[Vercel TRPC] ⚠️ AUCUN créneau bookable - Diagnostic:');
      console.warn(`  - Disponibilités trouvées: ${disponibiliteCount}`);
      console.warn(`  - Blocages trouvés: ${blocageCount}`);
      console.warn(`  - Rendez-vous en BD: ${bookedFromDb.size}`);
      console.warn('  ✓ Vérifier que les événements iCal contiennent "DISPONIBLE" dans le titre');
      console.warn('  ✓ Vérifier que les créneaux sont dans le futur');
      console.warn('  ✓ Vérifier que les créneaux ne sont pas déjà réservés');
    }
    
    slots.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

    return slots;
  } catch (error: any) {
    console.error('[Vercel TRPC] ❌ Erreur lors de la recuperation des disponibilites:', error);
    console.error('[Vercel TRPC] Type d\'erreur:', error.constructor.name);
    console.error('[Vercel TRPC] Message:', error.message);
    console.error('[Vercel TRPC] Stack:', error.stack);
    
    // Détails supplémentaires selon le type d'erreur
    if (error.code) {
      console.error('[Vercel TRPC] Code d\'erreur:', error.code);
    }
    if (error.response) {
      console.error('[Vercel TRPC] Réponse HTTP:', {
        status: error.response.status,
        statusText: error.response.statusText,
      });
    }
    
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
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.GOOGLE_CALENDAR_PRIVATE_KEY;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CALENDAR_EMAIL;
  const targetCalendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!privateKey || !serviceAccountEmail) {
    console.warn('[Vercel TRPC] Configuration Google Calendar incomplete pour creation evenement');
    console.warn('  - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:', privateKey ? 'OK' : 'MANQUANT');
    console.warn('  - GOOGLE_SERVICE_ACCOUNT_EMAIL:', serviceAccountEmail ? 'OK' : 'MANQUANT');
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
      calendarId: targetCalendarId || serviceAccountEmail,
      requestBody: event,
      sendUpdates: 'all',
    });

    console.log('[Vercel TRPC] Evenement Google Calendar cree:', response.data.id);
    return response.data.id || null;
  } catch (error) {
    console.error('[Vercel TRPC] Erreur creation evenement Google Calendar:', error);
    return null;
  }
}

async function deleteGoogleCalendarEvent(eventId: string): Promise<boolean> {
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.GOOGLE_CALENDAR_PRIVATE_KEY;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CALENDAR_EMAIL;
  const targetCalendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!privateKey || !serviceAccountEmail) {
    console.warn('[Vercel TRPC] Configuration Google Calendar incomplete pour suppression evenement');
    return false;
  }

  try {
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({
      calendarId: targetCalendarId || serviceAccountEmail,
      eventId: eventId,
      sendUpdates: 'all',
    });

    console.log('[Vercel TRPC] Evenement Google Calendar supprime:', eventId);
    return true;
  } catch (error) {
    console.error('[Vercel TRPC] Erreur suppression evenement Google Calendar:', error);
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
          console.log("[Vercel TRPC] getAvailabilitiesByDate appele avec:", input);
          
          const startDate = input.startDate ? new Date(input.startDate) : new Date();
          const endDate = input.endDate ? new Date(input.endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
          
          // La fonction getAvailableSlotsFromIcal filtre deja les creneaux reserves (iCal + BD)
          const icalSlots = await getAvailableSlotsFromIcal(startDate, endDate, process.env.DATABASE_URL);
          
          const slotsByDate: Record<string, any[]> = {};
          
          for (const slot of icalSlots) {
            if (!slotsByDate[slot.date]) {
              slotsByDate[slot.date] = [];
            }
            slotsByDate[slot.date].push(slot);
          }
          
          for (const date of Object.keys(slotsByDate)) {
            slotsByDate[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
          }
          
          const availableDates = Object.keys(slotsByDate).sort();
          console.log(`[Vercel TRPC] ${availableDates.length} dates disponibles depuis iCal (apres filtrage)`);
          
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
        
        // La fonction filtre deja les creneaux reserves
        const slots = await getAvailableSlotsFromIcal(startDate, endDate, process.env.DATABASE_URL);
        
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
