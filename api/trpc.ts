import { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";

const t = initTRPC.context<any>().create({
  transformer: superjson,
});

const router = t.router;
const publicProcedure = t.procedure;

const DEFAULT_AVAILABILITY_CONFIG = {
  workDays: [1, 2, 3, 4, 5],
  morningStart: "09:00",
  morningEnd: "12:00",
  afternoonStart: "14:00",
  afternoonEnd: "18:00",
  slotDuration: 60,
};

function generateDefaultSlotsForDate(date: Date): string[] {
  const dayOfWeek = date.getDay();
  const slots: string[] = [];
  const now = new Date();
  
  if (!DEFAULT_AVAILABILITY_CONFIG.workDays.includes(dayOfWeek)) {
    return [];
  }
  
  const dateStr = date.toISOString().split('T')[0];
  
  let [hours, minutes] = DEFAULT_AVAILABILITY_CONFIG.morningStart.split(':').map(Number);
  const [endMorningHours] = DEFAULT_AVAILABILITY_CONFIG.morningEnd.split(':').map(Number);
  
  while (hours < endMorningHours) {
    const slotTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const slotDateTime = new Date(`${dateStr}T${slotTime}:00`);
    
    if (slotDateTime > now) {
      slots.push(slotTime);
    }
    hours += 1;
  }
  
  [hours, minutes] = DEFAULT_AVAILABILITY_CONFIG.afternoonStart.split(':').map(Number);
  const [endAfternoonHours] = DEFAULT_AVAILABILITY_CONFIG.afternoonEnd.split(':').map(Number);
  
  while (hours < endAfternoonHours) {
    const slotTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const slotDateTime = new Date(`${dateStr}T${slotTime}:00`);
    
    if (slotDateTime > now) {
      slots.push(slotTime);
    }
    hours += 1;
  }
  
  return slots;
}

async function getBookedSlots(databaseUrl: string | undefined): Promise<Set<string>> {
  const bookedSlots = new Set<string>();
  
  if (!databaseUrl) {
    return bookedSlots;
  }

  try {
    const sql = neon(databaseUrl);
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

const appRouter = router({
  booking: router({
    getAvailabilitiesByDate: publicProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          console.log("[Vercel TRPC] getAvailabilitiesByDate appelé avec:", input);
          
          const startDate = input.startDate ? new Date(input.startDate) : new Date();
          const endDate = input.endDate ? new Date(input.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          
          const bookedSlots = await getBookedSlots(process.env.DATABASE_URL);
          
          const slotsByDate: Record<string, any[]> = {};
          const currentDate = new Date(startDate);
          
          while (currentDate <= endDate) {
            const daySlots = generateDefaultSlotsForDate(new Date(currentDate));
            
            if (daySlots.length > 0) {
              const dateStr = currentDate.toISOString().split('T')[0];
              slotsByDate[dateStr] = [];
              
              for (const slotTime of daySlots) {
                const slotKey = `${dateStr}|${slotTime}`;
                
                if (!bookedSlots.has(slotKey)) {
                  const endHour = parseInt(slotTime.split(':')[0]) + 1;
                  slotsByDate[dateStr].push({
                    date: dateStr,
                    startTime: slotTime,
                    endTime: `${endHour.toString().padStart(2, '0')}:00`,
                    duration: 60,
                    title: "Disponible (60 min)",
                  });
                }
              }
              
              if (slotsByDate[dateStr].length === 0) {
                delete slotsByDate[dateStr];
              } else {
                slotsByDate[dateStr].sort((a, b) => a.startTime.localeCompare(b.startTime));
              }
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          const availableDates = Object.keys(slotsByDate).sort();
          console.log(`[Vercel TRPC] ${availableDates.length} dates disponibles`);
          
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
        
        const slots: any[] = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const daySlots = generateDefaultSlotsForDate(new Date(currentDate));
          const dateStr = currentDate.toISOString().split('T')[0];
          
          for (const slotTime of daySlots) {
            const endHour = parseInt(slotTime.split(':')[0]) + 1;
            slots.push({
              date: dateStr,
              startTime: slotTime,
              endTime: `${endHour.toString().padStart(2, '0')}:00`,
              duration: 60,
              title: "Disponible (60 min)",
            });
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
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
          
          if (process.env.DATABASE_URL) {
            const sql = neon(process.env.DATABASE_URL);
            
            await sql`
              INSERT INTO appointments 
              ("practitionerId", "serviceId", "startTime", "endTime", status, "customerName", "customerEmail", "customerPhone", notes, "cancellationHash", "createdAt", "updatedAt")
              VALUES 
              (1, 1, ${appointmentDate.toISOString()}, ${endDate.toISOString()}, 'confirmed', ${`${input.patientInfo.firstName} ${input.patientInfo.lastName}`}, ${input.patientInfo.email}, ${input.patientInfo.phone}, ${input.patientInfo.reason || null}, ${cancellationHash}, NOW(), NOW())
            `;
          }
          
          return {
            success: true,
            appointmentHash: cancellationHash,
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
      console.log("[Vercel TRPC] Request body:", body?.substring(0, 200));
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
    console.log("[Vercel TRPC] Response:", responseBody?.substring(0, 200));
    res.send(responseBody);
  } catch (error: any) {
    console.error("[Vercel TRPC] Handler error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
}
