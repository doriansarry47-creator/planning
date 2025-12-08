import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { getGoogleCalendarIcalService } from './services/googleCalendarIcal';

/**
 * Router TRPC pour la réservation de rendez-vous par les patients
 * Utilise uniquement le flux iCal pour lire les disponibilités depuis Google Calendar
 * et créer les rendez-vous directement dans le calendrier
 */
export const patientBookingRouter = router({
  /**
   * Récupérer les créneaux disponibles depuis Google Calendar (lecture iCal)
   * PUBLIC - Accessible aux patients
   */
  getAvailableSlots: publicProcedure
    .input(
      z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      })
    )
    .query(async ({ input }) => {
      const service = getGoogleCalendarIcalService();
      
      if (!service) {
        throw new Error('Service Google Calendar non configuré. Vérifiez vos variables d\'environnement.');
      }

      try {
        const startDate = input.startDate ? new Date(input.startDate) : undefined;
        const endDate = input.endDate ? new Date(input.endDate) : undefined;

        // Récupérer les créneaux disponibles depuis le calendrier iCal
        const slots = await service.getAvailableSlots(startDate, endDate);

        // Grouper les créneaux par date pour faciliter l'affichage
        const slotsByDate = await service.getAvailableSlotsByDate(startDate, endDate);

        return {
          success: true,
          slots,
          slotsByDate,
          totalSlots: slots.length,
          message: `${slots.length} créneaux disponibles trouvés`,
        };
      } catch (error: any) {
        console.error('[PatientBooking] Erreur lors de la récupération des créneaux:', error);
        return {
          success: false,
          slots: [],
          slotsByDate: {},
          totalSlots: 0,
          error: error.message || 'Erreur lors de la récupération des disponibilités',
        };
      }
    }),

  /**
   * Vérifier la disponibilité d'un créneau spécifique
   * PUBLIC - Accessible aux patients
   */
  checkSlotAvailability: publicProcedure
    .input(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Format YYYY-MM-DD
        startTime: z.string().regex(/^\d{2}:\d{2}$/), // Format HH:mm
        endTime: z.string().regex(/^\d{2}:\d{2}$/), // Format HH:mm
      })
    )
    .query(async ({ input }) => {
      const service = getGoogleCalendarIcalService();
      
      if (!service) {
        throw new Error('Service Google Calendar non configuré');
      }

      try {
        const isAvailable = await service.isSlotAvailable(
          input.date,
          input.startTime,
          input.endTime
        );

        return {
          success: true,
          isAvailable,
          slot: {
            date: input.date,
            startTime: input.startTime,
            endTime: input.endTime,
          },
        };
      } catch (error: any) {
        console.error('[PatientBooking] Erreur lors de la vérification de disponibilité:', error);
        return {
          success: false,
          isAvailable: false,
          error: error.message || 'Erreur lors de la vérification',
        };
      }
    }),

  /**
   * Réserver un créneau (créer un rendez-vous)
   * PUBLIC - Accessible aux patients
   */
  bookAppointment: publicProcedure
    .input(
      z.object({
        patientName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
        patientEmail: z.string().email('Email invalide'),
        patientPhone: z.string().optional(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Format YYYY-MM-DD
        startTime: z.string().regex(/^\d{2}:\d{2}$/), // Format HH:mm
        endTime: z.string().regex(/^\d{2}:\d{2}$/), // Format HH:mm
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const service = getGoogleCalendarIcalService();
      
      if (!service) {
        throw new Error('Service Google Calendar non configuré');
      }

      try {
        // Vérifier d'abord que le créneau est toujours disponible
        const isAvailable = await service.isSlotAvailable(
          input.date,
          input.startTime,
          input.endTime
        );

        if (!isAvailable) {
          return {
            success: false,
            error: 'Ce créneau n\'est plus disponible. Veuillez en choisir un autre.',
          };
        }

        // Créer le rendez-vous dans Google Calendar
        const eventId = await service.bookAppointment({
          patientName: input.patientName,
          patientEmail: input.patientEmail,
          patientPhone: input.patientPhone,
          date: new Date(input.date),
          startTime: input.startTime,
          endTime: input.endTime,
          reason: input.reason,
        });

        if (!eventId) {
          return {
            success: false,
            error: 'Erreur lors de la création du rendez-vous. Veuillez réessayer.',
          };
        }

        // ✅ SAUVEGARDER LE RENDEZ-VOUS EN BASE DE DONNÉES
        try {
          const { getDb } = await import("./db");
          const db = await getDb();
          const { appointments } = await import("../drizzle/schema");
          
          const appointmentDate = new Date(input.date);
          const [startHours, startMinutes] = input.startTime.split(':').map(Number);
          const [endHours, endMinutes] = input.endTime.split(':').map(Number);
          
          const startDateTime = new Date(appointmentDate);
          startDateTime.setHours(startHours, startMinutes, 0, 0);
          
          const endDateTime = new Date(appointmentDate);
          endDateTime.setHours(endHours, endMinutes, 0, 0);
          
          await db
            .insert(appointments)
            .values({
              practitionerId: 1, // Default practitioner
              serviceId: 1, // Default service
              startTime: startDateTime,
              endTime: endDateTime,
              status: "confirmed",
              customerName: input.patientName,
              customerEmail: input.patientEmail,
              customerPhone: input.patientPhone || '',
              notes: input.reason || "",
              googleEventId: eventId,
            });
          
          console.log(`[PatientBooking] ✅ Rendez-vous sauvegardé en BD: ${startDateTime.toISOString()}`);
        } catch (dbError: any) {
          console.error("[PatientBooking] ❌ Erreur sauvegarde BD:", dbError);
          // Ne pas bloquer la réservation si la sauvegarde en BD échoue
        }

        // Envoyer un email de confirmation au patient
        try {
          const { sendAppointmentConfirmationEmail } = await import('./services/emailService');
          
          const emailData = {
            patientName: input.patientName,
            patientEmail: input.patientEmail,
            practitionerName: 'Dr. Dorian Sarry', // Nom par défaut
            date: new Date(input.date),
            startTime: input.startTime,
            endTime: input.endTime,
            reason: input.reason || 'Consultation',
            location: '20 rue des Jacobins, 24000 Périgueux',
            appointmentHash: eventId, // Utiliser l'ID Google Calendar comme hash
          };

          const emailResult = await sendAppointmentConfirmationEmail(emailData);
          
          if (emailResult.success) {
            console.log('[PatientBooking] ✅ Email de confirmation envoyé:', emailResult.messageId);
          } else {
            console.warn('[PatientBooking] ⚠️ Email de confirmation non envoyé:', emailResult.error);
          }
        } catch (emailError: any) {
          console.error('[PatientBooking] ❌ Erreur lors de l\'envoi de l\'email:', emailError);
          // Ne pas bloquer la réservation si l'email échoue
        }

        return {
          success: true,
          eventId,
          message: 'Rendez-vous confirmé ! Vous allez recevoir un email de confirmation.',
          appointment: {
            patientName: input.patientName,
            patientEmail: input.patientEmail,
            date: input.date,
            startTime: input.startTime,
            endTime: input.endTime,
            reason: input.reason,
          },
        };
      } catch (error: any) {
        console.error('[PatientBooking] Erreur lors de la réservation:', error);
        return {
          success: false,
          error: error.message || 'Erreur lors de la réservation. Veuillez réessayer.',
        };
      }
    }),

  /**
   * Annuler un rendez-vous
   * PUBLIC - Accessible aux patients avec l'ID de l'événement
   */
  cancelAppointment: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        patientEmail: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const service = getGoogleCalendarIcalService();
      
      if (!service) {
        throw new Error('Service Google Calendar non configuré');
      }

      try {
        const success = await service.cancelAppointment(input.eventId);

        if (!success) {
          return {
            success: false,
            error: 'Impossible d\'annuler le rendez-vous. Veuillez contacter le cabinet.',
          };
        }

        return {
          success: true,
          message: 'Rendez-vous annulé avec succès. Un email de confirmation a été envoyé.',
        };
      } catch (error: any) {
        console.error('[PatientBooking] Erreur lors de l\'annulation:', error);
        return {
          success: false,
          error: error.message || 'Erreur lors de l\'annulation. Veuillez réessayer.',
        };
      }
    }),

  /**
   * Obtenir le résumé des disponibilités par mois
   * PUBLIC - Pour afficher un calendrier avec les jours disponibles
   */
  getMonthSummary: publicProcedure
    .input(
      z.object({
        year: z.number().min(2024).max(2030),
        month: z.number().min(1).max(12),
      })
    )
    .query(async ({ input }) => {
      const service = getGoogleCalendarIcalService();
      
      if (!service) {
        throw new Error('Service Google Calendar non configuré');
      }

      try {
        // Calculer le premier et dernier jour du mois
        const startDate = new Date(input.year, input.month - 1, 1);
        const endDate = new Date(input.year, input.month, 0, 23, 59, 59);

        const slotsByDate = await service.getAvailableSlotsByDate(startDate, endDate);

        // Créer un résumé par jour
        const summary: Record<string, { hasSlots: boolean; slotsCount: number }> = {};
        
        Object.entries(slotsByDate).forEach(([date, slots]) => {
          summary[date] = {
            hasSlots: slots.length > 0,
            slotsCount: slots.length,
          };
        });

        return {
          success: true,
          year: input.year,
          month: input.month,
          summary,
          totalDaysWithSlots: Object.keys(summary).length,
        };
      } catch (error: any) {
        console.error('[PatientBooking] Erreur lors du résumé mensuel:', error);
        return {
          success: false,
          summary: {},
          totalDaysWithSlots: 0,
          error: error.message || 'Erreur lors de la récupération du résumé',
        };
      }
    }),
});
