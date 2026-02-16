import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { getGoogleCalendarService } from "./services/googleCalendar";
import { appointments, services } from "../drizzle/schema";
import { sendAppointmentConfirmationEmail } from "./services/emailService";
import { eq } from "drizzle-orm";
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
            const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            for (const slot of availableSlots) {
              // Vérifier si le créneau commence dans plus de 24h
              const slotStartTime = new Date(`${slot.date}T${slot.startTime}:00+01:00`);
              if (slotStartTime < twentyFourHoursFromNow) {
                continue; // Ignorer les créneaux trop proches
              }

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

      // 🛡️ NOUVELLE RÈGLE: Empêcher la réservation moins de 24h à l'avance
      const now = new Date();
      const appointmentStartTime = new Date(`${input.date}T${input.time}:00+01:00`);
      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      if (appointmentStartTime < twentyFourHoursFromNow) {
        return {
          success: false,
          error: "Les rendez-vous doivent être pris au moins 24 heures à l'avance.",
        };
      }

      const service = getGoogleCalendarService();
      if (!service) throw new Error("Service de calendrier non disponible");

      const { firstName, lastName, email, phone, reason } = input.patientInfo;
      const startTime = input.time;
      const appointmentDate = new Date(input.date);
      
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
        
        // Récupérer les informations du service pour le tarif et la durée
        const serviceInfo = await db.select().from(services).where(eq(services.id, 1)).limit(1);
        const serviceData = serviceInfo[0] || { price: "60.00", duration: 60, currency: "EUR" } as any;

        const appointmentValues = {
          practitionerId: 1,
          serviceId: 1,
          startTime: startDateTime,
          endTime: endDateTime,
          status: "confirmed" as const,
          customerName: `${firstName} ${lastName}`,
          customerEmail: email,
          customerPhone: phone,
          notes: reason || "",
          googleEventId: eventId,
          cancellationHash: Math.random().toString(36).substring(2, 15),
        };

        await db.insert(appointments).values(appointmentValues as any);
        console.log("[BookingRouter] ✅ RDV enregistré en base de données");

        // Envoi de l'email de confirmation
        console.log("[BookingRouter] 📧 Envoi de l'email de confirmation à:", email);
        const emailResult = await sendAppointmentConfirmationEmail({
          patientName: `${firstName} ${lastName}`,
          patientEmail: email,
          practitionerName: "Dorian Sarry",
          date: appointmentDate,
          startTime,
          endTime,
          reason: reason || "Consultation",
          location: "20 rue des Jacobins, 24000 Périgueux",
          durationMinutes: Number(serviceData.duration),
          price: Number(serviceData.price),
          currency: serviceData.currency,
          appointmentHash: appointmentValues.cancellationHash,
        });
        console.log("[BookingRouter] 📧 Résultat de l'envoi:", emailResult.success ? "Succès" : "Échec: " + emailResult.error);
        
      } catch (dbError) {
        console.error("[BookingRouter] ⚠️ Erreur base de données ou email:", dbError);
      }

      return { success: true, eventId };
    }),
});