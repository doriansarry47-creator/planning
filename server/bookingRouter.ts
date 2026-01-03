import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { getGoogleCalendarService } from "./services/googleCalendar";
import { appointments } from "../drizzle/schema";
import { calculateAvailableSlots, convertGoogleEventToSimpleEvent } from "./services/availabilityCalculator";
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = 'Europe/Paris';

/**
 * Router pour la réservation de rendez-vous patient
 * Utilise Google Calendar OAuth 2.0 (via GoogleCalendarService)
 */

const bookAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format d'heure invalide (HH:mm)"),
  patientInfo: z.object({
    firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(8, "Numéro de téléphone invalide (min 8 caractères)"),
    reason: z.string().optional(),
  }),
});

const getAvailabilitiesSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const bookingRouter = router({
  getAvailabilitiesByDate: publicProcedure
    .input(getAvailabilitiesSchema)
    .mutation(async ({ input }) => {
      console.log("[BookingRouter] 📅 Récupération des disponibilités (Calculateur Déterministe)");
      const service = getGoogleCalendarService();
      
      try {
        const now = new Date();
        const nowZoned = toZonedTime(now, TIMEZONE);
        const startDateStr = input.startDate || formatInTimeZone(nowZoned, TIMEZONE, 'yyyy-MM-dd');
        
        let endDateStr: string;
        if (input.endDate) {
          endDateStr = input.endDate;
        } else {
          const endDateObj = new Date(startDateStr);
          endDateObj.setDate(endDateObj.getDate() + 30);
          endDateStr = formatInTimeZone(toZonedTime(endDateObj, TIMEZONE), TIMEZONE, 'yyyy-MM-dd');
        }

        console.log(`[BookingRouter] Période: ${startDateStr} au ${endDateStr} (Now Paris: ${formatInTimeZone(nowZoned, TIMEZONE, 'yyyy-MM-dd HH:mm:ss')})`);

        if (service) {
          const calendar = (service as any).oauth2Service 
            ? (service as any).oauth2Service.calendar 
            : (service as any).calendar;

          const calendarId = (service as any).config?.calendarId || "primary";

          if (calendar) {
            // Utiliser le début de journée Paris pour timeMin et fin de journée pour timeMax
            // On utilise formatInTimeZone pour s'assurer que la date est interprétée dans la bonne timezone
            const timeMin = new Date(`${startDateStr}T00:00:00+01:00`).toISOString();
            const timeMax = new Date(`${endDateStr}T23:59:59+01:00`).toISOString();

            const response = await calendar.events.list({
              calendarId: calendarId,
              timeMin,
              timeMax,
              singleEvents: true,
              orderBy: 'startTime',
            });

            const googleEvents = response.data.items || [];
            console.log(`[BookingRouter] Google API: Found ${googleEvents.length} events`);
            
            const simpleEvents = googleEvents.map(convertGoogleEventToSimpleEvent);

            // Calculer les créneaux avec le moteur déterministe (Stateless)
            const availableSlots = calculateAvailableSlots(startDateStr, endDateStr, simpleEvents);
            
            const slotsByDate: Record<string, any[]> = {};
            for (const slot of availableSlots) {
              if (!slotsByDate[slot.date]) {
                slotsByDate[slot.date] = [];
              }
              slotsByDate[slot.date].push({
                ...slot,
                title: "Disponible (60 min)",
              });
            }

            console.log(`[BookingRouter] ✅ Succès: ${Object.keys(slotsByDate).length} jours disponibles`);

            return {
              success: true,
              slotsByDate,
              availableDates: Object.keys(slotsByDate).sort(),
            };
          }
        }

        return { success: false, slotsByDate: {}, availableDates: [], error: "Service de calendrier non initialisé" };
      } catch (error: any) {
        console.error("[BookingRouter] ❌ Erreur critique:", error);
        throw new Error(`Erreur serveur: ${error.message}`);
      }
    }),

  bookAppointment: publicProcedure
    .input(bookAppointmentSchema)
    .mutation(async ({ input }) => {
      console.log("[BookingRouter] 📥 Réservation reçue:", input.date, input.time);
      const service = getGoogleCalendarService();
      if (!service) throw new Error("Service de calendrier non disponible");

      const { firstName, lastName, email, phone, reason } = input.patientInfo;
      const startTime = input.time;
      const appointmentDate = new Date(input.date);
      
      const [hours, minutes] = startTime.split(':').map(Number);
      // On crée la date en spécifiant l'offset de Paris (+01:00 en hiver)
      const startDateTime = new Date(`${input.date}T${startTime}:00+01:00`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
      const endTime = formatInTimeZone(endDateTime, TIMEZONE, 'HH:mm');

      const eventId = await service.createEvent({
        date: appointmentDate,
        startTime,
        endTime,
        patientName: `${firstName} ${lastName}`,
        patientEmail: email,
        patientPhone: phone,
        reason,
        practitionerName: "Dorian Sarry",
      });

      if (!eventId) throw new Error("Échec de la création du rendez-vous dans Google Calendar");

      try {
        const { getDb } = await import("./db");
        const db = await getDb();
        await db.insert(appointments).values({
          practitionerId: 1,
          serviceId: 1,
          startTime: startDateTime,
          endTime: endDateTime,
          status: "confirmed",
          customerName: `${firstName} ${lastName}`,
          customerEmail: email,
          customerPhone: phone,
          notes: reason || "",
          googleEventId: eventId,
        });
        console.log("[BookingRouter] ✅ RDV enregistré en base de données");
      } catch (dbError) {
        console.error("[BookingRouter] ⚠️ Erreur base de données (le RDV Google Calendar est créé):", dbError);
      }

      return { success: true, eventId };
    }),
});