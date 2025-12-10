import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { getGoogleCalendarService } from "./services/googleCalendar";
import { getGoogleCalendarIcalService } from "./services/googleCalendarIcal";
import { appointments } from "../drizzle/schema";

/**
 * Router pour la réservation de rendez-vous patient
 * Utilise Google Calendar Service Account pour lire les disponibilités
 * et créer les rendez-vous avec une durée fixe de 60 minutes
 */

// Schéma de validation pour la réservation
// Compatible avec le format envoyé par OptimizedBookAppointment.tsx
const bookAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"), // Format YYYY-MM-DD
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format d'heure invalide (HH:mm)"), // Format HH:mm
  patientInfo: z.object({
    firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(8, "Numéro de téléphone invalide (min 8 caractères)"),
    reason: z.string().optional(),
  }),
});

// Schéma pour récupérer les disponibilités
const getAvailabilitiesSchema = z.object({
  startDate: z.string().optional(), // Format YYYY-MM-DD
  endDate: z.string().optional(),   // Format YYYY-MM-DD
});

/**
 * Configuration des horaires de disponibilité par défaut du praticien
 * Utilisé comme fallback quand Google Calendar n'est pas configuré
 */
const DEFAULT_AVAILABILITY_CONFIG = {
  workDays: [1, 2, 3, 4, 5], // Lundi à vendredi (0 = dimanche, 6 = samedi)
  morningStart: "09:00",
  morningEnd: "12:00",
  afternoonStart: "14:00", 
  afternoonEnd: "18:00",
  slotDuration: 60, // minutes
};

/**
 * Générer les créneaux de disponibilité par défaut pour une date donnée
 * Utilisé comme fallback quand Google Calendar n'est pas disponible
 */
function generateDefaultSlotsForDate(date: Date): string[] {
  const dayOfWeek = date.getDay();
  const slots: string[] = [];
  const now = new Date();
  
  // Vérifier si c'est un jour de travail
  if (!DEFAULT_AVAILABILITY_CONFIG.workDays.includes(dayOfWeek)) {
    return [];
  }
  
  const dateStr = date.toISOString().split('T')[0];
  
  // Générer les créneaux du matin
  let [hours, minutes] = DEFAULT_AVAILABILITY_CONFIG.morningStart.split(':').map(Number);
  const [endMorningHours] = DEFAULT_AVAILABILITY_CONFIG.morningEnd.split(':').map(Number);
  
  while (hours < endMorningHours) {
    const slotTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const slotDateTime = new Date(`${dateStr}T${slotTime}:00`);
    
    // Ne pas inclure les créneaux passés
    if (slotDateTime > now) {
      slots.push(slotTime);
    }
    
    hours += 1; // Créneaux de 60 minutes
  }
  
  // Générer les créneaux de l'après-midi
  [hours, minutes] = DEFAULT_AVAILABILITY_CONFIG.afternoonStart.split(':').map(Number);
  const [endAfternoonHours] = DEFAULT_AVAILABILITY_CONFIG.afternoonEnd.split(':').map(Number);
  
  while (hours < endAfternoonHours) {
    const slotTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const slotDateTime = new Date(`${dateStr}T${slotTime}:00`);
    
    // Ne pas inclure les créneaux passés
    if (slotDateTime > now) {
      slots.push(slotTime);
    }
    
    hours += 1; // Créneaux de 60 minutes
  }
  
  return slots;
}

export const bookingRouter = router({
  /**
   * Récupérer les disponibilités groupées par date
   * Filtre les créneaux déjà réservés par d'autres patients
   */
  getAvailabilitiesByDate: publicProcedure
    .input(getAvailabilitiesSchema)
    .mutation(async ({ input }) => {
      console.log("[BookingRouter BATCH] Récupération des disponibilités groupées par date");
      const service = getGoogleCalendarService();
      const useGoogleCalendar = service !== null;
      
      if (!useGoogleCalendar) {
        console.log("[BookingRouter] Google Calendar non configuré, utilisation des créneaux par défaut");
      }

      try {
        const startDate = input.startDate ? new Date(input.startDate) : new Date();
        const endDate = input.endDate ? new Date(input.endDate) : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        const slotsByDate: Record<string, any[]> = {};
        
        if (useGoogleCalendar) {
          // Utiliser le service Google Calendar pour récupérer les créneaux
          const rawSlots = await service!.getAvailabilitySlots(startDate, endDate, 60);
          
          for (const slot of rawSlots) {
            if (slot.isAvailable) {
              const dateStr = slot.date.toISOString().split('T')[0];
              if (!slotsByDate[dateStr]) {
                slotsByDate[dateStr] = [];
              }
              slotsByDate[dateStr].push({
                date: dateStr,
                startTime: slot.startTime,
                endTime: slot.endTime,
                duration: 60,
                title: "Disponible (60 min)",
              });
            }
          }
        } else {
          // Utiliser les créneaux par défaut
          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            const daySlots = generateDefaultSlotsForDate(new Date(currentDate));
            
            if (daySlots.length > 0) {
              const dateStr = currentDate.toISOString().split('T')[0];
              slotsByDate[dateStr] = daySlots.map(slotTime => ({
                date: dateStr,
                startTime: slotTime,
                endTime: `${(parseInt(slotTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
                duration: 60,
                title: "Disponible (60 min)",
              }));
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }

        console.log(`[BookingRouter BATCH] ✅ ${Object.keys(slotsByDate).length} dates disponibles`);

        return {
          success: true,
          slotsByDate,
          availableDates: Object.keys(slotsByDate).sort(),
        };
      } catch (error: any) {
        console.error("[BookingRouter] Erreur:", error);
        throw new Error(`Impossible de récupérer les disponibilités: ${error.message}`);
      }
    }),

  /**
   * Réserver un rendez-vous
   * Crée un événement dans Google Calendar et envoie les emails de confirmation
   */
  bookAppointment: publicProcedure
    .input(bookAppointmentSchema)
    .mutation(async ({ input }) => {
      console.log('[BookingRouter] 📥 Données reçues pour réservation:', JSON.stringify(input, null, 2));
      
      const service = getGoogleCalendarService();
      const fallbackService = getGoogleCalendarIcalService(); // Fallback vers l'ancien service iCal
      
      // Extraire les données du patientInfo
      const { firstName, lastName, email, phone, reason } = input.patientInfo;
      const startTime = input.time; // Renommer 'time' en 'startTime' pour cohérence
      
      try {
        // Calculer l'heure de fin (60 minutes après le début)
        const appointmentDate = new Date(input.date);
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDateTime = new Date(appointmentDate);
        startDateTime.setHours(hours, minutes, 0, 0);
        
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +60 minutes
        const endTime = endDateTime.toTimeString().slice(0, 5); // HH:mm

        let eventId: string | null = null;

        // Essayer avec le service Google Calendar
        if (service !== null) {
          try {
            console.log("[BookingRouter] Tentative de réservation avec service Google Calendar...");
            
            eventId = await service.createEvent({
              date: appointmentDate,
              startTime: startTime,
              endTime: endTime,
              patientName: `${firstName} ${lastName}`,
              patientEmail: email,
              patientPhone: phone,
              reason: reason,
              practitionerName: "Dorian Sarry", // Nom du praticien
            });

            if (eventId) {
              console.log("[BookingRouter] ✅ Rendez-vous créé dans Google Calendar:", eventId);
            }
          } catch (calendarError: any) {
            console.warn("[BookingRouter] ⚠️ Erreur Google Calendar:", calendarError.message);
          }
        }

        // Fallback vers l'ancien service iCal si Google Calendar échoue
        if (!eventId && fallbackService) {
          try {
            console.log("[BookingRouter] Tentative de réservation avec service iCal fallback...");
            
            eventId = await fallbackService.bookAppointment({
              patientName: `${firstName} ${lastName}`,
              patientEmail: email,
              patientPhone: phone,
              date: appointmentDate,
              startTime: startTime,
              endTime: endTime,
              reason: reason,
            });

            if (eventId) {
              console.log("[BookingRouter] ✅ Rendez-vous créé avec iCal fallback:", eventId);
            }
          } catch (icalError: any) {
            console.error("[BookingRouter] ❌ Erreur service iCal fallback:", icalError);
          }
        }

        // Si aucun service Google Calendar n'est disponible, générer un ID local
        if (!eventId) {
          console.log("[BookingRouter] Aucun service Google Calendar disponible, création d'un ID local");
          // Générer un ID unique basé sur la date et l'heure
          const timestamp = Date.now();
          const randomPart = Math.random().toString(36).substring(2, 9);
          eventId = `local_${timestamp}_${randomPart}`;
          console.log("[BookingRouter] ✅ Rendez-vous créé localement avec ID:", eventId);
        }

        // ✅ SAUVEGARDER LE RENDEZ-VOUS EN BASE DE DONNÉES
        try {
          const { getDb } = await import("./db");
          const db = await getDb();
          const { appointments } = await import("../drizzle/schema");
          
          const result = await db
            .insert(appointments)
            .values({
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
          
          console.log(`[BookingRouter] ✅ Rendez-vous CONFIRMÉ en BD: ${startDateTime.toISOString()} - ${email}`);
        } catch (dbError: any) {
          console.error("[BookingRouter] ❌ Erreur sauvegarde BD:", dbError.message);
          throw new Error(`Erreur lors de la sauvegarde: ${dbError.message}`);
        }

        // Envoyer les notifications selon la préférence du patient
        const sendNotifications = input.sendNotifications || 'both';
        const notificationResults: { email?: string; sms?: string } = {};

        // Envoyer l'email si demandé
        if (sendNotifications === 'email' || sendNotifications === 'both') {
          try {
            const { sendAppointmentConfirmationEmail } = await import("./services/emailService");
            
            const emailResult = await sendAppointmentConfirmationEmail({
              patientName: `${firstName} ${lastName}`,
              patientEmail: email,
              practitionerName: "Dorian Sarry",
              date: appointmentDate,
              startTime: input.startTime,
              endTime: endTime,
              reason: reason || "",
              location: "Cabinet - Voir email pour l'adresse exacte",
              appointmentHash: eventId,
            });

            if (!emailResult.success) {
              console.warn("[BookingRouter] ⚠️ Email de confirmation non envoyé:", emailResult.error);
              notificationResults.email = `Erreur: ${emailResult.error}`;
            } else {
              console.log("[BookingRouter] ✅ Email de confirmation envoyé:", emailResult.messageId);
              notificationResults.email = "✅ Email envoyé";
            }
          } catch (emailError: any) {
            console.error("[BookingRouter] ❌ Erreur lors de l'envoi de l'email:", emailError);
            notificationResults.email = `Erreur: ${emailError.message}`;
          }
        }

        // Envoyer le SMS si demandé
        if (sendNotifications === 'sms' || sendNotifications === 'both') {
          try {
            const { sendAppointmentSMS } = await import("./services/smsService");
            
            const smsResult = await sendAppointmentSMS({
              patientName: `${firstName} ${lastName}`,
              patientPhone: phone,
              date: appointmentDate,
              startTime: input.startTime,
              endTime: endTime,
              practitionerName: "Dorian Sarry",
            });

            if (!smsResult.success) {
              console.warn("[BookingRouter] ⚠️ SMS de confirmation non envoyé:", smsResult.error);
              notificationResults.sms = `Erreur: ${smsResult.error}`;
            } else {
              console.log("[BookingRouter] ✅ SMS de confirmation envoyé:", smsResult.messageId);
              notificationResults.sms = "✅ SMS envoyé";
            }
          } catch (smsError: any) {
            console.error("[BookingRouter] ❌ Erreur lors de l'envoi du SMS:", smsError);
            notificationResults.sms = `Erreur: ${smsError.message}`;
          }
        }

        return {
          success: true,
          eventId,
          message: "Rendez-vous confirmé ! Vous allez recevoir une confirmation.",
          notificationStatus: notificationResults,
          appointmentDetails: {
            date: input.date,
            startTime: startTime,
            endTime: endTime,
            duration: 60,
            patientName: `${firstName} ${lastName}`,
            patientEmail: email,
          },
        };
      } catch (error: any) {
        console.error("[BookingRouter] Erreur lors de la réservation:", error);
        throw new Error(error.message || "Impossible de réserver le rendez-vous");
      }
    }),

  /**
   * Vérifier si un créneau spécifique est disponible
   */
  checkAvailability: publicProcedure
    .input(z.object({
      date: z.string(),
      startTime: z.string(),
    }))
    .query(async ({ input }) => {
      const service = getGoogleCalendarService();
      const fallbackService = getGoogleCalendarIcalService();
      
      try {
        // Calculer l'heure de fin (60 minutes)
        const [hours, minutes] = input.startTime.split(':').map(Number);
        const startDateTime = new Date(`${input.date}T${input.startTime}:00`);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
        const endTime = endDateTime.toTimeString().slice(0, 5);

        let isAvailable = false;

        // Essayer avec le service Google Calendar
        if (service !== null) {
          try {
            // Récupérer les créneaux disponibles pour la journée
            const availableSlots = await service.getAvailabilitySlots(startDateTime, endDateTime, 60);
            
            // Vérifier si le créneau exact est disponible
            isAvailable = availableSlots.some(slot => 
              slot.isAvailable && 
              slot.startTime === input.startTime && 
              slot.date.toISOString().split('T')[0] === input.date
            );
            
            if (isAvailable) {
              console.log("[BookingRouter] Créneau disponible confirmé via Google Calendar");
            }
          } catch (calendarError: any) {
            console.warn("[BookingRouter] Erreur vérification Google Calendar:", calendarError.message);
          }
        }

        // Fallback vers l'ancien service iCal si Google Calendar échoue ou si pas disponible
        if (!isAvailable && fallbackService) {
          try {
            isAvailable = await fallbackService.isSlotAvailable(input.date, input.startTime, endTime);
            
            if (isAvailable) {
              console.log("[BookingRouter] Créneau disponible confirmé via iCal fallback");
            }
          } catch (icalError: any) {
            console.error("[BookingRouter] Erreur vérification iCal fallback:", icalError);
          }
        }

        return {
          success: true,
          available: isAvailable,
        };
      } catch (error: any) {
        console.error("[BookingRouter] Erreur lors de la vérification:", error);
        return {
          success: false,
          available: false,
          error: error.message,
        };
      }
    }),

  /**
   * Health check pour vérifier l'état du service
   */
  healthCheck: publicProcedure
    .input(z.object({}))
    .query(async () => {
      const service = getGoogleCalendarService();
      const fallbackService = getGoogleCalendarIcalService();

      return {
        success: true,
        calendarServiceAvailable: service !== null,
        icalAvailable: !!fallbackService,
        timestamp: new Date().toISOString(),
      };
    }),

  /**
   * Récupérer les créneaux disponibles pour une date spécifique
   */
  getAvailableSlots: publicProcedure
    .input(z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Format YYYY-MM-DD
    }))
    .query(async ({ input }) => {
      const service = getGoogleCalendarService();
      const fallbackService = getGoogleCalendarIcalService();

      try {
        const targetDate = new Date(input.date);
        let availableSlots: string[] = [];

        // Essayer avec Google Calendar
        if (service !== null) {
          try {
            const rawSlots = await service!.getAvailabilitySlots(targetDate, targetDate, 60);
            availableSlots = rawSlots
              .filter(slot => slot.isAvailable)
              .map(slot => slot.startTime);
            
            console.log(`[BookingRouter] Google Calendar: ${availableSlots.length} créneaux trouvés pour ${input.date}`);
          } catch (calendarError: any) {
            console.warn("[BookingRouter] Erreur Google Calendar, utilisation fallback iCal:", calendarError.message);
          }
        }

        // Fallback vers iCal si Google Calendar échoue
        if (availableSlots.length === 0 && fallbackService) {
          try {
            const dayStart = new Date(targetDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(targetDate);
            dayEnd.setHours(23, 59, 59, 999);

            const slots = await fallbackService.getAvailableSlots(dayStart, dayEnd);
            availableSlots = slots
              .filter(slot => slot.date === input.date)
              .map(slot => slot.startTime);

            console.log(`[BookingRouter] iCal: ${availableSlots.length} créneaux trouvés pour ${input.date}`);
          } catch (icalError: any) {
            console.error("[BookingRouter] Erreur iCal fallback:", icalError);
          }
        }

        return {
          success: true,
          availableSlots,
          date: input.date,
        };
      } catch (error: any) {
        console.error("[BookingRouter] Erreur lors de la récupération des créneaux:", error);
        return {
          success: false,
          availableSlots: [],
          error: error.message,
        };
      }
    }),
});
