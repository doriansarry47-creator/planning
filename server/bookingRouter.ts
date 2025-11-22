import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { getGoogleCalendarIcalService } from "./services/googleCalendarIcal";

/**
 * Router pour la réservation de rendez-vous patient
 * Utilise Google Calendar iCal pour lire les disponibilités
 * et créer les rendez-vous avec une durée fixe de 60 minutes
 */

// Schéma de validation pour la réservation
const bookAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Format YYYY-MM-DD
  startTime: z.string().regex(/^\d{2}:\d{2}$/), // Format HH:mm
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  reason: z.string().optional(),
});

// Schéma pour récupérer les disponibilités
const getAvailabilitiesSchema = z.object({
  startDate: z.string().optional(), // Format YYYY-MM-DD
  endDate: z.string().optional(),   // Format YYYY-MM-DD
});

/**
 * Convertir un créneau de disponibilité en créneaux de 60 minutes
 */
function splitSlotInto60MinSlots(slot: any): any[] {
  const slotStart = new Date(`${slot.date}T${slot.startTime}:00`);
  const slotEnd = new Date(`${slot.date}T${slot.endTime}:00`);
  const durationMs = slotEnd.getTime() - slotStart.getTime();
  const durationMinutes = durationMs / (1000 * 60);
  
  const slots: any[] = [];
  const slotDuration = 60; // Durée fixe de 60 minutes
  
  // Générer les créneaux de 60 minutes
  for (let offset = 0; offset + slotDuration <= durationMinutes; offset += slotDuration) {
    const start = new Date(slotStart.getTime() + offset * 60 * 1000);
    const end = new Date(start.getTime() + slotDuration * 60 * 1000);
    
    slots.push({
      date: slot.date,
      startTime: start.toTimeString().slice(0, 5), // HH:mm
      endTime: end.toTimeString().slice(0, 5), // HH:mm
      duration: slotDuration,
      title: `Disponible (${slotDuration} min)`,
    });
  }
  
  return slots;
}

export const bookingRouter = router({
  /**
   * Récupérer les disponibilités depuis Google Calendar
   * Retourne les créneaux de 60 minutes disponibles
   */
  getAvailabilities: publicProcedure
    .input(getAvailabilitiesSchema)
    .query(async ({ input }) => {
      const service = getGoogleCalendarIcalService();
      
      if (!service) {
        throw new Error("Service Google Calendar non configuré");
      }

      try {
        const startDate = input.startDate ? new Date(input.startDate) : undefined;
        const endDate = input.endDate ? new Date(input.endDate) : undefined;

        // Récupérer les créneaux disponibles depuis iCal
        const availableSlots = await service.getAvailableSlots(startDate, endDate);
        
        // Convertir chaque créneau en créneaux de 60 minutes
        const slots60Min: any[] = [];
        
        for (const slot of availableSlots) {
          const minuteSlots = splitSlotInto60MinSlots(slot);
          slots60Min.push(...minuteSlots);
        }

        console.log(`[BookingRouter] ${availableSlots.length} créneaux trouvés, convertis en ${slots60Min.length} créneaux de 60min`);

        return {
          success: true,
          slots: slots60Min,
        };
      } catch (error: any) {
        console.error("[BookingRouter] Erreur lors de la récupération des disponibilités:", error);
        throw new Error(`Impossible de récupérer les disponibilités: ${error.message}`);
      }
    }),

  /**
   * Récupérer les disponibilités groupées par date
   * Retourne un objet avec les dates comme clés et les créneaux comme valeurs
   */
  getAvailabilitiesByDate: publicProcedure
    .input(getAvailabilitiesSchema)
    .query(async ({ input }) => {
      const service = getGoogleCalendarIcalService();
      
      if (!service) {
        throw new Error("Service Google Calendar non configuré");
      }

      try {
        const startDate = input.startDate ? new Date(input.startDate) : undefined;
        const endDate = input.endDate ? new Date(input.endDate) : undefined;

        // Récupérer les créneaux disponibles depuis iCal
        const availableSlots = await service.getAvailableSlots(startDate, endDate);
        
        // Convertir en créneaux de 60 minutes et grouper par date
        const slotsByDate: Record<string, any[]> = {};
        
        for (const slot of availableSlots) {
          const minuteSlots = splitSlotInto60MinSlots(slot);
          
          for (const minSlot of minuteSlots) {
            if (!slotsByDate[minSlot.date]) {
              slotsByDate[minSlot.date] = [];
            }
            slotsByDate[minSlot.date].push(minSlot);
          }
        }

        // Trier les créneaux de chaque date
        Object.keys(slotsByDate).forEach(date => {
          slotsByDate[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
        });

        console.log(`[BookingRouter] Disponibilités groupées pour ${Object.keys(slotsByDate).length} dates`);

        return {
          success: true,
          slotsByDate,
          availableDates: Object.keys(slotsByDate).sort(),
        };
      } catch (error: any) {
        console.error("[BookingRouter] Erreur lors de la récupération des disponibilités:", error);
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
      const service = getGoogleCalendarIcalService();
      
      if (!service) {
        throw new Error("Service Google Calendar non configuré");
      }

      try {
        // Calculer l'heure de fin (60 minutes après le début)
        const appointmentDate = new Date(input.date);
        const [hours, minutes] = input.startTime.split(':').map(Number);
        const startDateTime = new Date(appointmentDate);
        startDateTime.setHours(hours, minutes, 0, 0);
        
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +60 minutes
        const endTime = endDateTime.toTimeString().slice(0, 5); // HH:mm

        // Vérifier que le créneau est toujours disponible
        const isAvailable = await service.isSlotAvailable(input.date, input.startTime, endTime);
        
        if (!isAvailable) {
          throw new Error("Ce créneau n'est plus disponible. Veuillez en choisir un autre.");
        }

        // Créer le rendez-vous dans Google Calendar
        const eventId = await service.bookAppointment({
          patientName: `${input.firstName} ${input.lastName}`,
          patientEmail: input.email,
          patientPhone: input.phone,
          date: appointmentDate,
          startTime: input.startTime,
          endTime: endTime,
          reason: input.reason,
        });

        if (!eventId) {
          throw new Error("Impossible de créer le rendez-vous dans Google Calendar");
        }

        // Envoyer l'email de confirmation
        try {
          const { sendAppointmentConfirmationEmail } = await import("./services/emailService");
          
          const emailResult = await sendAppointmentConfirmationEmail({
            patientName: `${input.firstName} ${input.lastName}`,
            patientEmail: input.email,
            practitionerName: "Dorian Sarry",
            date: appointmentDate,
            startTime: input.startTime,
            endTime: endTime,
            reason: input.reason || "",
            location: "Cabinet - Voir email pour l'adresse exacte",
            appointmentHash: eventId, // Utiliser l'eventId comme hash pour l'annulation
          });

          if (!emailResult.success) {
            console.warn("[BookingRouter] ⚠️ Email de confirmation non envoyé:", emailResult.error);
          } else {
            console.log("[BookingRouter] ✅ Email de confirmation envoyé:", emailResult.messageId);
          }
        } catch (emailError: any) {
          console.error("[BookingRouter] ❌ Erreur lors de l'envoi de l'email:", emailError);
          // Ne pas bloquer la réservation si l'email échoue
        }

        console.log(`[BookingRouter] ✅ Rendez-vous créé avec succès: ${eventId}`);

        return {
          success: true,
          eventId,
          message: "Rendez-vous confirmé ! Un email de confirmation vous a été envoyé.",
          appointmentDetails: {
            date: input.date,
            startTime: input.startTime,
            endTime: endTime,
            duration: 60,
            patientName: `${input.firstName} ${input.lastName}`,
            patientEmail: input.email,
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
      const service = getGoogleCalendarIcalService();
      
      if (!service) {
        throw new Error("Service Google Calendar non configuré");
      }

      try {
        // Calculer l'heure de fin (60 minutes)
        const [hours, minutes] = input.startTime.split(':').map(Number);
        const startDateTime = new Date(`${input.date}T${input.startTime}:00`);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
        const endTime = endDateTime.toTimeString().slice(0, 5);

        const isAvailable = await service.isSlotAvailable(input.date, input.startTime, endTime);

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
});
